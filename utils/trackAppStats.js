import { getSessionId } from "./sessionId";

const DOWNLOAD_DEBOUNCE_MS = 5000;

/** @type {Map<string, number>} */
const downloadLastSentAt = new Map();

/**
 * Fire-and-forget App view/download track via BFF.
 * Failures are silent so UX is never blocked.
 *
 * @param {string} packageId
 * @param {"view" | "download"} type
 */
export function trackAppStats(packageId, type) {
  if (!packageId || (type !== "view" && type !== "download")) {
    return;
  }

  const sessionId = getSessionId();
  if (!sessionId) {
    return;
  }

  if (type === "download") {
    const now = Date.now();
    const last = downloadLastSentAt.get(packageId) || 0;
    if (now - last < DOWNLOAD_DEBOUNCE_MS) {
      return;
    }
    downloadLastSentAt.set(packageId, now);
  }

  fetch(`/api/apps/${encodeURIComponent(packageId)}/stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, sessionId }),
  }).catch(() => {});
}
