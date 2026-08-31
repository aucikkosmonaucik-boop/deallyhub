/**
 * Deallyhub Content & Profanity Filter Module
 * Detects and blocks offensive, profane, and abusive words across listings, messages, and user profiles.
 * Supports multilingual detection (PL, EN, DE) with advanced leetspeak, spacing, and accent bypass resilience.
 */

// Safe words whitelist - words that contain sub-patterns but are completely legitimate in classifieds/e-commerce
const SAFE_WORDS_WHITELIST = new Set([
  "rabat",
  "rabatu",
  "rabaty",
  "faktura",
  "faktury",
  "fakturę",
  "dokument",
  "dokumenty",
  "klasyk",
  "klasyka",
  "klasyczny",
  "klasyczna",
  "klasyczne",
  "skrot",
  "skrotu",
  "skroty",
  "przesylka",
  "przesylki",
  "wysylka",
  "wysylki",
  "sukienka",
  "sukienki",
  "sukienke",
  "poszukiwany",
  "poszukiwana",
  "szmatka",
  "szmatki",
  "szmatke",
  "sciereczka",
  "pedal rowerowy",
  "pedal gazu",
  "pedal hamulca",
  "pedal sprzegla",
  "pedaly rowerowe",
  "pedaly platformowe",
  "pedaly spd",
  "pedaly shimano"
]);

// Base profanity stems & regex patterns (normalized representation: no accents, lowercase)
const PROFANITY_PATTERNS = [
  // --- POLISH (PL) ---
  // Kurw*
  /\b(?:w|na|za|od|po|przy|pod|roz)?k+[uou]+r+w+[aeyiouoęąśźż]*\b/i,
  /\bk+u+r+w+[a-z]*\b/i,
  /\bk+u+r+e+w+s+k+[a-z]*\b/i,
  /\bk+u+r+w+i+s+z+o+n[a-z]*\b/i,
  /\bk+u+r+w+i+s+k+o[a-z]*\b/i,

  // Chuj* / Huj*
  /\b(?:o|od|za|po|z)?(?:ch|h)+[uou]+j+[a-z]*\b/i,
  /\b(?:ch|h)+u+j+e+k[a-z]*\b/i,
  /\b(?:ch|h)+u+j+n+i+[a-z]*\b/i,
  /\b(?:ch|h)+u+j+o+w+[a-z]*\b/i,

  // Jeb*
  /\b(?:wy|za|do|od|pod|roz|na|u|s|z|po|prze|przy)?j+e+b+[a-z]*\b/i,
  /\bj+e+b+a+n+[a-z]*\b/i,
  /\bj+e+b+a+k+[a-z]*\b/i,
  /\bz+j+e+b+[a-z]*\b/i,
  /\bp+o+j+e+b+[a-z]*\b/i,

  // Pierdol* / Spierdal*
  /\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na)?p+i+e+r+d+o+l+[a-z]*\b/i,
  /\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na)?p+i+e+r+d+a+l+[a-z]*\b/i,
  /\bp+i+e+r+d+o+l+e+\b/i,
  /\bp+i+e+r+d+o+l+i+s+z+\b/i,
  /\bp+i+e+r+d+o+l+a+\b/i,
  /\bp+i+e+r+d+y+k+n+[a-z]*\b/i,

  // Pizd*
  /\b(?:wy|od|za|s)?p+i+z+d+[a-z]*\b/i,
  /\bp+i+z+d+a+\b/i,
  /\bp+i+z+d+z+i+e+\b/i,
  /\bp+i+z+d+o+w+a+t+[a-z]*\b/i,

  // Cip*
  /\bc+i+p+[aeyoęąu]\b/i,
  /\bc+i+p+k+[a-z]*\b/i,
  /\bc+i+p+s+k+o[a-z]*\b/i,

  // Kutas*
  /\bk+u+t+a+s+[a-z]*\b/i,

  // Cwel*
  /\bc+w+e+l+[a-z]*\b/i,

  // Pedał (wulgaryzm/slur - wykluczamy kontekst rowerowy w safe words)
  /\bp+e+d+a+l+a+m+i\b/i,
  /\bp+e+d+a+l+s+k+[a-z]*\b/i,
  /\bj+e+b+a+n+y+ +p+e+d+a+l+\b/i,
  /\bt+y+ +p+e+d+a+l+e+\b/i,

  // Dziwk* / Szmat*
  /\bd+z+i+w+k+[a-z]*\b/i,
  /\bs+z+m+a+t+[aeyoęąu]\b/i,
  /\bs+z+m+a+c+i+e+\b/i,
  /\bs+z+m+a+t+l+a+w+i+e+c\b/i,

  // Skurw*
  /\bs+k+u+r+w+y+s+y+n[a-z]*\b/i,
  /\bs+k+u+r+w+i+e+l[a-z]*\b/i,
  /\bs+u+k+i+n+s+y+n[a-z]*\b/i,

  // Inne ciężkie obelgi
  /\bc+h+u+j+o+z+a\b/i,
  /\bd+o+j+e+b+a+n+[a-z]*\b/i,
  /\bp+i+e+r+d+z+i+e+l+[a-z]*\b/i,
  /\br+u+c+h+a+n+i+e\b/i,
  /\br+u+c+h+a+c\b/i,
  /\bw+y+r+u+c+h+a+c\b/i,

  // --- ENGLISH (EN) ---
  /\bf+u+c+k+[a-z]*\b/i,
  /\bm+o+t+h+e+r+f+u+c+k+[a-z]*\b/i,
  /\bs+h+i+t+[a-z]*\b/i,
  /\bb+u+l+l+s+h+i+t+\b/i,
  /\bb+i+t+c+h+[a-z]*\b/i,
  /\bc+u+n+t+[a-z]*\b/i,
  /\ba+s+s+h+o+l+e+[a-z]*\b/i,
  /\bd+i+c+k+h+e+a+d+[a-z]*\b/i,
  /\bp+u+s+s+y+\b/i,
  /\bn+i+g+g+e+r+[a-z]*\b/i,
  /\bn+i+g+g+a+[a-z]*\b/i,
  /\bf+a+g+g+o+t+[a-z]*\b/i,
  /\bw+h+o+r+e+[a-z]*\b/i,
  /\bs+l+u+t+[a-z]*\b/i,
  /\bb+a+s+t+a+r+d+[a-z]*\b/i,

  // --- GERMAN (DE) ---
  /\bs+c+h+e+i+s+s+[a-z]*\b/i,
  /\ba+r+s+c+h+l+o+c+h+[a-z]*\b/i,
  /\bh+u+r+e+n+s+o+h+n+[a-z]*\b/i,
  /\bf+o+t+z+e+[a-z]*\b/i,
  /\bw+i+c+h+s+e+r+[a-z]*\b/i,
  /\bs+c+h+l+a+m+p+e+[a-z]*\b/i,
  /\bf+i+c+k+e+n+[a-z]*\b/i
];

/**
 * Normalizes text to handle leetspeak, diacritics, and obfuscations.
 */
function normalizeText(text) {
  if (typeof text !== "string") return "";

  let norm = text.toLowerCase();

  // 1. Normalize Polish diacritics
  const diacriticsMap = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
    ä: "ae",
    ö: "oe",
    ü: "ue",
    ß: "ss"
  };
  norm = norm.replace(/[ąćęłńóśźżäöüß]/g, (ch) => diacriticsMap[ch] || ch);

  // 2. Normalize Leetspeak and symbol substitutions
  const leetMap = {
    "@": "a",
    "0": "o",
    "1": "i",
    "!": "i",
    "|": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
    "8": "b",
    v: "u",
    vv: "w"
  };

  // Convert leet chars surrounded by letters or standalone
  norm = norm.replace(/[@01!|345$7+8]/g, (ch) => leetMap[ch] || ch);

  return norm;
}

/**
 * Collapses obfuscations like "k.u.r.w.a", "k u r w a", "k-u-r-w-a", "k_u_r_w_a", "k*r*w*a"
 */
function collapseObfuscations(text) {
  // Remove symbols that separate letters within words
  return text.replace(/([a-z])[\s._\-*~#^/\\]+([a-z])/gi, "$1$2");
}

/**
 * Reduces repeated characters like "kuuuuurwa" -> "kurwa"
 */
function reduceRepeats(text) {
  return text.replace(/(.)\1{2,}/gi, "$1$1");
}

/**
 * Check if the provided text contains any banned or offensive words.
 * @param {string} text - The input text to check.
 * @returns {{ hasProfanity: boolean, matchedWord: string | null }}
 */
function containsProfanity(text) {
  if (!text || typeof text !== "string") {
    return { hasProfanity: false, matchedWord: null };
  }

  const rawNormalized = normalizeText(text);

  // Variations to check:
  // 1. Normal normalized text
  // 2. Obfuscation-collapsed text (e.g. "k.u.r.w.a")
  // 3. Repeated-character-reduced text (e.g. "kuuuuuurwa")
  const collapsed = collapseObfuscations(rawNormalized);
  const collapsedReduced = reduceRepeats(collapsed);
  const collapsed2 = collapseObfuscations(collapsed); // double pass for multi-separators

  const testVariants = [
    rawNormalized,
    collapsed,
    collapsedReduced,
    collapsed2,
    reduceRepeats(rawNormalized)
  ];

  for (const variant of testVariants) {
    for (const pattern of PROFANITY_PATTERNS) {
      const match = variant.match(pattern);
      if (match) {
        const matchedStr = match[0].trim();
        let isWhitelisted = false;
        for (const safe of SAFE_WORDS_WHITELIST) {
          if (safe === matchedStr || variant.includes(safe)) {
            isWhitelisted = true;
            break;
          }
        }

        if (!isWhitelisted) {
          return {
            hasProfanity: true,
            matchedWord: matchedStr
          };
        }
      }
    }
  }

  return {
    hasProfanity: false,
    matchedWord: null
  };
}

/**
 * Censoring helper function that masks profanities with asterisks (e.g., "k****a").
 * @param {string} text - The input text to censor.
 * @returns {string}
 */
function censorProfanity(text) {
  if (!text || typeof text !== "string") return text;

  let censored = text;

  for (const pattern of PROFANITY_PATTERNS) {
    censored = censored.replace(pattern, (match) => {
      if (match.length <= 2) return "*".repeat(match.length);
      return match[0] + "*".repeat(match.length - 2) + match[match.length - 1];
    });
  }

  return censored;
}

export {
  containsProfanity,
  censorProfanity,
  normalizeText,
  SAFE_WORDS_WHITELIST
};
export default {
  containsProfanity,
  censorProfanity,
  normalizeText,
  SAFE_WORDS_WHITELIST
};
