/** Same invisible-character strip as POST /feedbacks, then trim. */
const STRIP_PATTERN =
  /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u200B-\u200D\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g;

export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;

export const FEEDBACK_CATEGORIES = Object.freeze(["bug", "suggestion", "other"]);

/**
 * @param {unknown} message
 * @returns {string}
 */
export function normalizeFeedbackMessage(message) {
  if (typeof message !== "string") return "";
  return message.replace(STRIP_PATTERN, "").trim();
}

/**
 * Build the JSON body, or explain why it must not be sent.
 * @param {{ category?: unknown, message?: unknown }} input
 * @returns {{ ok: true, body: { category: string, message: string } } | { ok: false, reason: "category" | "empty" | "length" }}
 */
export function prepareFeedback({ category, message } = {}) {
  if (typeof category !== "string" || !FEEDBACK_CATEGORIES.includes(category)) {
    return { ok: false, reason: "category" };
  }

  const normalized = normalizeFeedbackMessage(message);
  if (!normalized) return { ok: false, reason: "empty" };
  if (normalized.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    return { ok: false, reason: "length" };
  }

  return { ok: true, body: { category, message: normalized } };
}

/**
 * POST /feedbacks with category and message only. Does not set Authorization.
 * @param {{ category?: unknown, message?: unknown }} input
 */
export async function submitFeedback(input) {
  const prepared = prepareFeedback(input);
  if (!prepared.ok) {
    return { response: null, error: prepared.reason, status: null };
  }

  const { default: fetchWinstallAPI } = await import("./fetchWinstallAPI.js");
  return fetchWinstallAPI("/feedbacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prepared.body),
  });
}
