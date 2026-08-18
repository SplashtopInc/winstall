import { getSessionId } from "./sessionId";
import { postAnalyticsTrack } from "./postAnalyticsTrack";

const DOWNLOAD_DEBOUNCE_MS = 5000;

/** @type {Map<string, number>} */
const downloadLastSentAt = new Map();

/**
 * Fire-and-forget App view/download track via API analytics.
 * Failures are silent so UX is never blocked.
 *
 * @param {string} packageId
 * @param {"view" | "download"} type
 */
export function trackAppStats(packageId, type) {
  if (!packageId || (type !== "view" && type !== "download")) {
    return Promise.resolve();
  }

  const sessionId = getSessionId();
  if (!sessionId) {
    return Promise.resolve();
  }

  if (type === "download") {
    const now = Date.now();
    const last = downloadLastSentAt.get(packageId) || 0;
    if (now - last < DOWNLOAD_DEBOUNCE_MS) {
      return Promise.resolve();
    }
    downloadLastSentAt.set(packageId, now);
  }

  return postAnalyticsTrack({
    event: type,
    targetType: "app",
    targetId: packageId,
    sessionId,
  }).catch(() => {});
}
