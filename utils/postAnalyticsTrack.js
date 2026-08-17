import { getRuntimeConfig } from "./runtimeConfig";

/**
 * Fire-and-forget POST /analytics/track on the API origin.
 * @param {{ event: string, targetType: string, targetId: string, sessionId: string }} body
 */
export async function postAnalyticsTrack(body) {
  const config = await getRuntimeConfig();
  const apiBase = (config.apiBase || "").replace(/\/$/, "");
  if (!apiBase) return;

  await fetch(`${apiBase}/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(body),
  });
}
