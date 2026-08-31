/**
 * Deallyhub Client-Side Profanity Filter Module
 * Detects, validates, and censors offensive content in real-time on Web and Mobile Browsers.
 */

// Safe words whitelist - words that contain sub-patterns but are completely legitimate in classifieds/e-commerce
export const SAFE_WORDS_WHITELIST = new Set<string>([
  "rabat",
  "rabatu",
  "rabaty",
  "faktura",
  "faktury",
  "fakturę",
  "faktura vat",
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
  "poszukiwane",
  "szmatka",
  "szmatki",
  "szmatke",
  "sciereczka",
  "sciereczki",
  "pedal rowerowy",
  "pedal gazu",
  "pedal hamulca",
  "pedal sprzegla",
  "pedaly rowerowe",
  "pedaly platformowe",
  "pedaly spd",
  "pedaly shimano",
  "pedał rowerowy",
  "pedał gazu",
  "pedał hamulca",
  "pedał sprzęgła",
  "pedał platformowy",
  "pedał spd",
  "pedał shimano",
  "jebao",
  "kutasik",
  "assortment",
  "classic",
  "passage",
  "cocktail",
  "peacock",
  "dickies",
  "spitfire"
]);

// Base profanity patterns
export const PROFANITY_PATTERNS: RegExp[] = [
  // --- POLISH (PL) ---
  /\b(?:w|na|za|od|po|przy|pod|roz|do|s|u)?k+[uou]*r+w+[a-z]*\b/i,
  /\bk+[uou]*r+w+[a-z]*\b/i,
  /\bk+u+r+e+w+s+k+[a-z]*\b/i,
  /\bk+u+r+w+i+s+z+o+n[a-z]*\b/i,
  /\bk+u+r+w+i+s+k+o[a-z]*\b/i,
  /\bk+u+r+w+i+a+c[a-z]*\b/i,

  /\b(?:o|od|za|po|z|u|do|na|w)?(?:ch|h)+[uou]*j+[a-z]*\b/i,
  /\b(?:ch|h)+u+j+e+k[a-z]*\b/i,
  /\b(?:ch|h)+u+j+n+i+[a-z]*\b/i,
  /\b(?:ch|h)+u+j+o+w+[a-z]*\b/i,
  /\b(?:ch|h)+u+j+a+m+i\b/i,

  /\b(?:wy|za|do|od|pod|roz|na|u|s|z|po|prze|przy|w)?j+[eou]*b+[a-z]*\b/i,
  /\bj+[eou]*b+a+n+[a-z]*\b/i,
  /\bj+[eou]*b+a+k+[a-z]*\b/i,
  /\bz+j+[eou]*b+[a-z]*\b/i,
  /\bp+o+j+[eou]*b+[a-z]*\b/i,
  /\bj+e+b+n+i+e+t+[a-z]*\b/i,
  /\bj+[eou]*b+a+c\b/i,

  /\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na|w)?p+[i]*[e]?r+d+o+l+[a-z]*\b/i,
  /\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na|w)?p+[i]*[e]?r+d+a+l+[a-z]*\b/i,
  /\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na|w)?p+r+d+l+[a-z]*\b/i,
  /\bp+i+e+r+d+o+l+e+\b/i,
  /\bp+i+e+r+d+o+l+i+s+z+\b/i,
  /\bp+i+e+r+d+o+l+a+\b/i,
  /\bp+i+e+r+d+y+k+n+[a-z]*\b/i,
  /\bp+i+e+r+d+z+i+e+l+[a-z]*\b/i,

  /\b(?:wy|od|za|s|roz|o)?p+[i]*z+d+[a-z]*\b/i,
  /\bp+i+z+d+a+\b/i,
  /\bp+i+z+d+z+i+e+\b/i,
  /\bp+i+z+d+o+w+a+t+[a-z]*\b/i,
  /\bp+i+z+d+k+[a-z]*\b/i,

  /\bc+i+p+[aeyoęąu]\b/i,
  /\bc+i+p+k+[a-z]*\b/i,
  /\bc+i+p+s+k+o[a-z]*\b/i,
  /\bc+i+p+e+k[a-z]*\b/i,

  /\bk+u+t+a+s+[a-z]*\b/i,
  /\bc+w+e+l+[a-z]*\b/i,

  /\bp+e+d+a+l+a+m+i\b/i,
  /\bp+e+d+a+l+s+k+[a-z]*\b/i,
  /\bj+e+b+a+n+y+ +p+e+d+a+l+\b/i,
  /\bt+y+ +p+e+d+a+l+e+\b/i,
  /\bp+e+d+a+l+e+\b/i,

  /\bd+z+i+w+k+[a-z]*\b/i,
  /\bs+z+m+a+t+[aeyoęąu]\b/i,
  /\bs+z+m+a+c+i+e+\b/i,
  /\bs+z+m+a+t+l+a+w+i+e+c\b/i,

  /\bs+k+u+r+w+y+s+y+n[a-z]*\b/i,
  /\bs+k+u+r+w+i+e+l[a-z]*\b/i,
  /\bs+u+k+i+n+s+y+n[a-z]*\b/i,

  /\bc+h+u+j+o+z+a\b/i,
  /\bd+o+j+e+b+a+n+[a-z]*\b/i,
  /\br+u+c+h+a+n+i+e\b/i,
  /\br+u+c+h+a+c\b/i,
  /\bw+y+r+u+c+h+a+c\b/i,
  /\bw+k+u+r+w+[a-z]*\b/i,
  /\bn+a+j+e+b+a+n+[a-z]*\b/i,

  // --- ENGLISH (EN) ---
  /\bf+[uou]*c+k+[a-z]*\b/i,
  /\bm+o+t+h+e+r+f+[uou]*c+k+[a-z]*\b/i,
  /\bs+h+[i]*t+[a-z]*\b/i,
  /\bb+u+l+l+s+h+i+t+\b/i,
  /\bb+[i]*t+c+h+[a-z]*\b/i,
  /\bc+u+n+t+[a-z]*\b/i,
  /\ba+s+s+h+[o]*l+e+[a-z]*\b/i,
  /\bd+i+c+k+h+e+a+d+[a-z]*\b/i,
  /\bd+i+c+k+[a-z]*\b/i,
  /\bp+u+s+s+y+\b/i,
  /\bn+i+g+g+e+r+[a-z]*\b/i,
  /\bn+i+g+g+a+[a-z]*\b/i,
  /\bf+a+g+g+o+t+[a-z]*\b/i,
  /\bw+h+o+r+e+[a-z]*\b/i,
  /\bs+l+u+t+[a-z]*\b/i,
  /\bb+a+s+t+a+r+d+[a-z]*\b/i,
  /\bc+o+c+k+s+u+c+k+e+r+[a-z]*\b/i,

  // --- GERMAN (DE) ---
  /\bs+c+h+e+i+s+s+[a-z]*\b/i,
  /\ba+r+s+c+h+l+o+c+h+[a-z]*\b/i,
  /\bh+u+r+e+n+s+o+h+n+[a-z]*\b/i,
  /\bf+o+t+z+e+[a-z]*\b/i,
  /\bw+i+c+h+s+e+r+[a-z]*\b/i,
  /\bs+c+h+l+a+m+p+e+[a-z]*\b/i,
  /\bf+i+c+k+e+n+[a-z]*\b/i,
  /\bm+i+s+t+s+t+u+e+c+k+[a-z]*\b/i,

  // --- FRENCH (FR) ---
  /\bm+e+r+d+e+[a-z]*\b/i,
  /\bp+u+t+a+i+n+[a-z]*\b/i,
  /\bc+o+n+n+a+r+d+[a-z]*\b/i,
  /\bs+a+l+o+p+e+[a-z]*\b/i,
  /\be+n+c+u+l+e+[a-z]*\b/i,
  /\bf+i+l+s+ +d+e+ +p+u+t+e+\b/i,
  /\bp+u+t+e+[a-z]*\b/i,

  // --- SPANISH (ES) ---
  /\bm+i+e+r+d+a+[a-z]*\b/i,
  /\bh+i+j+o+ +d+e+ +p+u+t+a+\b/i,
  /\bc+a+b+r+o+n+[a-z]*\b/i,
  /\bp+e+n+d+e+j+o+[a-z]*\b/i,
  /\bc+o+n+o+[a-z]*\b/i,
  /\bg+i+l+i+p+o+l+l+a+s+[a-z]*\b/i,
  /\bp+u+t+a+[a-z]*\b/i,

  // --- ITALIAN (IT) ---
  /\bc+a+z+z+o+[a-z]*\b/i,
  /\bs+t+r+o+n+z+o+[a-z]*\b/i,
  /\bv+a+f+f+a+n+c+u+l+o+\b/i,
  /\bt+r+o+i+a+[a-z]*\b/i,
  /\bp+u+t+t+a+n+a+[a-z]*\b/i,
  /\bc+o+g+l+i+o+n+e+[a-z]*\b/i
];

export function normalizeText(text: string): string {
  if (!text || typeof text !== "string") return "";

  let norm = text.toLowerCase();

  const diacriticsMap: Record<string, string> = {
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
    ä: "ae", ö: "oe", ü: "ue", ß: "ss",
    é: "e", è: "e", ê: "e", ë: "e",
    á: "a", à: "a", â: "a",
    í: "i", ì: "i", î: "i", ï: "i",
    ò: "o", ô: "o",
    ú: "u", ù: "u", û: "u",
    ñ: "n", ç: "c"
  };
  norm = norm.replace(/[ąćęłńóśźżäöüßéèêëáàâíìîïóòôúùûñç]/g, (ch) => diacriticsMap[ch] || ch);

  const leetMap: Record<string, string> = {
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
  norm = norm.replace(/[@01!|345$7+8]/g, (ch) => leetMap[ch] || ch);

  return norm;
}

export function collapseObfuscations(text: string): string {
  return text.replace(/([a-z0-9])[\s._\-*~#^/\\,+]+([a-z0-9])/gi, "$1$2");
}

export function reduceRepeats(text: string): string {
  return text.replace(/(.)\1{2,}/gi, "$1$1");
}

export interface ProfanityCheckResult {
  hasProfanity: boolean;
  matchedWord: string | null;
}

export function containsProfanity(text: string): ProfanityCheckResult {
  if (!text || typeof text !== "string") {
    return { hasProfanity: false, matchedWord: null };
  }

  const rawNormalized = normalizeText(text);

  for (const safe of SAFE_WORDS_WHITELIST) {
    if (rawNormalized.trim() === safe) {
      return { hasProfanity: false, matchedWord: null };
    }
  }

  const collapsed = collapseObfuscations(rawNormalized);
  const collapsedReduced = reduceRepeats(collapsed);
  const collapsed2 = collapseObfuscations(collapsed);

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
          if (safe === matchedStr || (safe.length >= 4 && rawNormalized.includes(safe))) {
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

export function censorProfanity(text: string): string {
  if (!text || typeof text !== "string") return text;

  let censored = text;

  for (const pattern of PROFANITY_PATTERNS) {
    censored = censored.replace(pattern, (match) => {
      const normalizedMatch = normalizeText(match);
      if (SAFE_WORDS_WHITELIST.has(normalizedMatch)) {
        return match;
      }
      if (match.length <= 2) return "*".repeat(match.length);
      return match[0] + "*".repeat(match.length - 2) + match[match.length - 1];
    });
  }

  return censored;
}

export default {
  containsProfanity,
  censorProfanity,
  normalizeText,
  collapseObfuscations,
  reduceRepeats,
  SAFE_WORDS_WHITELIST,
  PROFANITY_PATTERNS
};
