const SKIP_CHARS = new Set([".", "-", "+"]);

/** Fixed neutral when id is missing; not the generic packaging gradient. */
const FALLBACK_BACKGROUND = "#64748b";

/** Short palette; avoids packaging-box pink/purple. */
const LETTER_BACKGROUNDS = [
  "#0f766e",
  "#0369a1",
  "#1d4ed8",
  "#4f46e5",
  "#7c3aed",
  "#a16207",
  "#b45309",
  "#c2410c",
  "#be123c",
  "#9f1239",
  "#0e7490",
  "#15803d",
];

function isVisibleChar(char) {
  if (!char || SKIP_CHARS.has(char) || /\s/.test(char)) return false;
  return (
    /\p{L}/u.test(char) ||
    /\p{Nd}/u.test(char) ||
    /\p{Script=Han}/u.test(char)
  );
}

function firstVisibleChar(text) {
  if (!text) return "";
  for (const char of String(text)) {
    if (isVisibleChar(char)) {
      return /\p{Script=Latin}/u.test(char) ? char.toUpperCase() : char;
    }
  }
  return "";
}

function lastIdSegment(id) {
  const raw = String(id || "").trim();
  if (!raw) return "";
  const parts = raw.split(".");
  return parts[parts.length - 1] || raw;
}

/**
 * Single letter for empty-icon fallback.
 * Prefers name; falls back to last dotted segment of id.
 */
export function getAppLetter({ name, id } = {}) {
  const fromName = firstVisibleChar(String(name || "").trim());
  if (fromName) return fromName;

  const fromId = firstVisibleChar(lastIdSegment(id));
  return fromId || "";
}

function hashId(id) {
  let hash = 0;
  const raw = String(id);
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable background from id; same id always maps to the same swatch. */
export function getAppLetterBackground(id) {
  const raw = String(id || "").trim();
  if (!raw) return FALLBACK_BACKGROUND;
  return LETTER_BACKGROUNDS[hashId(raw) % LETTER_BACKGROUNDS.length];
}
