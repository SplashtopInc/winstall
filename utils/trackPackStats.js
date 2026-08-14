import { getSessionId } from "./sessionId";

const DOWNLOAD_DEBOUNCE_MS = 5000;

/** @type {Map<string, number>} */
const downloadLastSentAt = new Map();

/**
 * Fire-and-forget Pack view/download track via BFF analytics.
 * Failures are silent so UX is never blocked.
 *
 * @param {string} packId
 * @param {"view" | "download"} type
 */
export function trackPackStats(packId, type) {
  if (!packId || (type !== "view" && type !== "download")) {
    return;
  }

  const sessionId = getSessionId();
  if (!sessionId) {
    return;
  }

  if (type === "download") {
    const now = Date.now();
    const last = downloadLastSentAt.get(packId) || 0;
    if (now - last < DOWNLOAD_DEBOUNCE_MS) {
      return;
    }
    downloadLastSentAt.set(packId, now);
  }

  fetch("/api/winstall/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      event: type,
      targetType: "pack",
      targetId: packId,
      sessionId,
    }),
  }).catch(() => {});
}
