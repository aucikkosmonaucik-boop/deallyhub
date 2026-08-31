/**
 * Deallyhub Global Nudity & Adult Content Filter Module
 * Detects and blocks explicit nudity, pornography, hentai, and adult imagery
 * across all uploaded ad images before publication.
 */

import * as tf from "@tensorflow/tfjs";
import * as nsfw from "nsfwjs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

// Cached NSFW classifier model instance
let nsfwModel = null;
let isModelLoading = false;
let modelLoadPromise = null;

// Thresholds for classification
export const NSFW_THRESHOLDS = {
  porn: 0.35,      // Explicit sexual acts / genitalia
  hentai: 0.40,    // Illustrated explicit pornography
  sexy: 0.70,      // Provocative / revealing nudity / erotic lingerie
  combinedAdult: 0.75 // Sum of porn + hentai + sexy
};

/**
 * Initializes and caches the NSFWJS machine learning model.
 */
export async function initImageFilter() {
  if (nsfwModel) return nsfwModel;

  if (isModelLoading && modelLoadPromise) {
    return modelLoadPromise;
  }

  isModelLoading = true;
  modelLoadPromise = (async () => {
    try {
      console.log("[ImageFilter] Loading NSFW neural network model...");
      nsfwModel = await nsfw.load();
      console.log("[ImageFilter] NSFW model initialized and ready.");
      return nsfwModel;
    } catch (err) {
      console.error("[ImageFilter] Failed to load NSFW model:", err.message);
      return null;
    } finally {
      isModelLoading = false;
    }
  })();

  return modelLoadPromise;
}

/**
 * Parses raw image input (Base64 string or HTTP URL) into a binary Buffer.
 */
async function getImageBuffer(input) {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();

  // 1. Data URI Base64 (e.g. data:image/jpeg;base64,....)
  if (trimmed.startsWith("data:")) {
    const commaIdx = trimmed.indexOf(",");
    if (commaIdx !== -1) {
      const base64Data = trimmed.substring(commaIdx + 1);
      return Buffer.from(base64Data, "base64");
    }
  }

  // 2. HTTP / HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(trimmed, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[ImageFilter] Failed to fetch image URL (${res.status}):`, trimmed.slice(0, 80));
        return null;
      }
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (fetchErr) {
      console.warn("[ImageFilter] Error fetching image URL:", fetchErr.message);
      return null;
    }
  }

  // 3. Raw Base64 string without data: prefix
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 100) {
    try {
      return Buffer.from(trimmed, "base64");
    } catch (e) {
      return null;
    }
  }

  return null;
}

/**
 * Decodes an image buffer (JPEG or PNG) into raw RGBA pixel data.
 */
function decodeImageBuffer(buffer) {
  if (!buffer || buffer.length < 8) return null;

  // Check magic bytes for JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // Check magic bytes for PNG: 89 50 4E 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

  if (isJpeg) {
    try {
      const decoded = jpeg.decode(buffer, { useTArray: true, maxMemoryUsageInMB: 64 });
      return { width: decoded.width, height: decoded.height, data: decoded.data };
    } catch (err) {
      console.warn("[ImageFilter] JPEG decode failed:", err.message);
    }
  }

  if (isPng) {
    try {
      const png = PNG.sync.read(buffer);
      return { width: png.width, height: png.height, data: png.data };
    } catch (err) {
      console.warn("[ImageFilter] PNG decode failed:", err.message);
    }
  }

  // Fallback attempt with jpeg decoder
  try {
    const decoded = jpeg.decode(buffer, { useTArray: true, maxMemoryUsageInMB: 64 });
    return { width: decoded.width, height: decoded.height, data: decoded.data };
  } catch (e) {
    // Fallback attempt with png decoder
    try {
      const png = PNG.sync.read(buffer);
      return { width: png.width, height: png.height, data: png.data };
    } catch (e2) {
      return null;
    }
  }
}

/**
 * Converts decoded RGBA image data into a TensorFlow 3D RGB Tensor.
 */
function createTensorFromRgba(decoded) {
  const { width, height, data } = decoded;
  const numChannels = 3;
  const numPixels = width * height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    values[i * 3] = data[i * 4];         // Red
    values[i * 3 + 1] = data[i * 4 + 1]; // Green
    values[i * 3 + 2] = data[i * 4 + 2]; // Blue
  }

  return tf.tensor3d(values, [height, width, numChannels], "int32");
}

/**
 * Skin tone exposure analyzer in YCbCr & RGB space (Forsyth-Fleck / Cheddad algorithm).
 * Detects excessive full-body skin exposure as a secondary safeguard.
 */
export function analyzeSkinTone(width, height, rgbaData) {
  const numPixels = width * height;
  if (numPixels === 0) return { skinRatio: 0, isHighExposure: false };

  let skinPixels = 0;

  for (let i = 0; i < numPixels; i++) {
    const r = rgbaData[i * 4];
    const g = rgbaData[i * 4 + 1];
    const b = rgbaData[i * 4 + 2];

    // RGB heuristic: R > 95, G > 40, B > 20, max-min > 15, |R-G| > 15, R > G, R > B
    const rgbIsSkin =
      r > 95 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      Math.abs(r - g) > 15 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15;

    // YCbCr transformation
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    const ycbcrIsSkin = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

    if (rgbIsSkin && ycbcrIsSkin) {
      skinPixels++;
    }
  }

  const skinRatio = skinPixels / numPixels;
  // If more than 60% of image is exposed skin, it's flagged as high exposure
  return {
    skinRatio,
    isHighExposure: skinRatio > 0.60
  };
}

/**
 * Evaluates predictions from NSFWJS classifier against safety thresholds.
 */
export function isNsfwPrediction(predictions) {
  const scores = {
    Porn: 0,
    Hentai: 0,
    Sexy: 0,
    Neutral: 0,
    Drawing: 0
  };

  for (const pred of predictions) {
    if (scores[pred.className] !== undefined) {
      scores[pred.className] = pred.probability;
    }
  }

  const combinedAdult = scores.Porn + scores.Hentai + scores.Sexy;

  const isPorn = scores.Porn >= NSFW_THRESHOLDS.porn;
  const isHentai = scores.Hentai >= NSFW_THRESHOLDS.hentai;
  const isSexy = scores.Sexy >= NSFW_THRESHOLDS.sexy;
  const isCombinedNsfw = combinedAdult >= NSFW_THRESHOLDS.combinedAdult && (scores.Porn > 0.20 || scores.Sexy > 0.40);

  const isNsfw = isPorn || isHentai || isSexy || isCombinedNsfw;

  let reason = null;
  if (isPorn) reason = "Explicit adult / pornographic content";
  else if (isHentai) reason = "Explicit adult illustrations / hentai";
  else if (isSexy) reason = "Erotic / sexually suggestive nudity";
  else if (isCombinedNsfw) reason = "High adult content score";

  return {
    isNsfw,
    reason,
    scores,
    combinedAdult
  };
}

/**
 * Checks a single image (Base64 or URL) for nudity / adult content.
 * @param {string} imageInput - Base64 data string or HTTP URL.
 * @returns {Promise<{ isSafe: boolean, reason: string | null, scores?: object }>}
 */
export async function checkImageForNudity(imageInput) {
  if (!imageInput || typeof imageInput !== "string") {
    return { isSafe: true, reason: null };
  }

  const buffer = await getImageBuffer(imageInput);
  if (!buffer) {
    // If buffer cannot be parsed or read, treat as neutral/unsupported image
    return { isSafe: true, reason: null };
  }

  const decoded = decodeImageBuffer(buffer);
  if (!decoded) {
    return { isSafe: true, reason: null };
  }

  // 1. Check with ML Neural Network Model
  let tensor = null;
  try {
    const model = await initImageFilter();
    if (model) {
      tensor = createTensorFromRgba(decoded);
      const predictions = await model.classify(tensor);
      const evalResult = isNsfwPrediction(predictions);

      if (evalResult.isNsfw) {
        return {
          isSafe: false,
          reason: evalResult.reason,
          scores: evalResult.scores
        };
      }
    }
  } catch (err) {
    console.warn("[ImageFilter] ML classification warning:", err.message);
  } finally {
    if (tensor) {
      try {
        tensor.dispose();
      } catch (e) {
        // tensor already disposed
      }
    }
  }

  // 2. Secondary check: Skin-tone excessive exposure analysis
  try {
    const skinAnalysis = analyzeSkinTone(decoded.width, decoded.height, decoded.data);
    if (skinAnalysis.isHighExposure) {
      return {
        isSafe: false,
        reason: `Excessive skin exposure detected (${Math.round(skinAnalysis.skinRatio * 100)}%)`,
        skinRatio: skinAnalysis.skinRatio
      };
    }
  } catch (skinErr) {
    console.warn("[ImageFilter] Skin analysis warning:", skinErr.message);
  }

  return { isSafe: true, reason: null };
}

/**
 * Checks an array of images for nudity / adult content.
 * Scans each image and blocks if any image contains prohibited content.
 * @param {string[]} images - Array of Base64 strings or URLs.
 * @returns {Promise<{ isSafe: boolean, reason: string | null, imageIndex: number | null }>}
 */
export async function checkImagesForNudity(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return { isSafe: true, reason: null, imageIndex: null };
  }

  for (let idx = 0; idx < images.length; idx++) {
    const img = images[idx];
    const checkResult = await checkImageForNudity(img);
    if (!checkResult.isSafe) {
      console.warn(`[ImageFilter] Prohibited image detected at index ${idx}: ${checkResult.reason}`);
      return {
        isSafe: false,
        reason: checkResult.reason,
        imageIndex: idx
      };
    }
  }

  return { isSafe: true, reason: null, imageIndex: null };
}

export default {
  initImageFilter,
  checkImageForNudity,
  checkImagesForNudity,
  analyzeSkinTone,
  isNsfwPrediction,
  NSFW_THRESHOLDS
};
