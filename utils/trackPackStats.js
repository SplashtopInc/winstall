import { getSessionId } from "./sessionId";
import { isPackApiViaWinstall } from "./packApiConfig";

const DOWNLOAD_DEBOUNCE_MS = 5000;

/** @type {Map<string, number>} */
const downloadLastSentAt = new Map();

/**
 * Fire-and-forget Pack view/download track.
 * Flag on: BFF `POST /api/winstall/analytics/track`.
 * Flag off: local `POST /api/packs/:id/stats` (`$inc` rollback).
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

  const viaApi = isPackApiViaWinstall();
  const url = viaApi
    ? "/api/winstall/analytics/track"
    : `/api/packs/${encodeURIComponent(packId)}/stats`;
  const body = viaApi
    ? { event: type, targetType: "pack", targetId: packId, sessionId }
    : { type, sessionId };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  }).catch(() => {});
}
