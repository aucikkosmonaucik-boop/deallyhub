import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { removeDeviceToken } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp = null;

function initFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    // 1. Check environment variable (JSON string or base64)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8");
        serviceAccount = JSON.parse(decoded);
      }
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("[PushService] Firebase Admin initialized from environment variable.");
      return firebaseApp;
    }

    // 2. Check local key files
    const possiblePaths = [
      path.resolve(__dirname, "../firebase-service-account.json"),
      path.resolve(__dirname, "./firebase-service-account.json"),
      path.resolve(__dirname, "../serviceAccountKey.json"),
      path.resolve(__dirname, "./serviceAccountKey.json"),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const serviceAccount = JSON.parse(fileContent);
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log(`[PushService] Firebase Admin initialized from file: ${filePath}`);
        return firebaseApp;
      }
    }

    console.log("[PushService] Note: Firebase credentials not found (set FIREBASE_SERVICE_ACCOUNT or add firebase-service-account.json). Push notifications are paused.");
    return null;
  } catch (err) {
    console.warn("[PushService] Warning: Failed to initialize Firebase Admin:", err.message);
    return null;
  }
}

export function isFirebaseReady() {
  return initFirebase() !== null;
}

export async function sendPushToDevices({ tokens = [], title, body, data = {} }) {
  const app = initFirebase();
  if (!app) {
    return {
      success: false,
      reason: "firebase_not_configured",
      successCount: 0,
      failureCount: 0
    };
  }

  if (!tokens || tokens.length === 0) {
    return {
      success: true,
      reason: "no_tokens",
      successCount: 0,
      failureCount: 0
    };
  }

  // Firebase allows up to 500 tokens per multicast
  const chunkSize = 500;
  let totalSuccess = 0;
  let totalFailure = 0;

  const stringifiedData = {};
  if (data) {
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && val !== null) {
        stringifiedData[key] = String(val);
      }
    }
  }

  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    const message = {
      notification: {
        title: title || "Deallyhub",
        body: body || ""
      },
      data: stringifiedData,
      tokens: chunk
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Clean up invalid or unregistered tokens
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === "messaging/registration-token-not-registered" ||
              errCode === "messaging/invalid-registration-token"
            ) {
              const deadToken = chunk[idx];
              removeDeviceToken(deadToken).catch(() => {});
            }
          }
        });
      }
    } catch (batchErr) {
      console.error("[PushService] Batch send error:", batchErr.message);
      totalFailure += chunk.length;
    }
  }

  return {
    success: true,
    successCount: totalSuccess,
    failureCount: totalFailure
  };
}
