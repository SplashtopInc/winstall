export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid app id." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, sessionId } = req.body || {};

  if (!type || !["view", "download"].includes(type)) {
    return res
      .status(400)
      .json({ error: "Invalid type. Must be 'view' or 'download'." });
  }

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required." });
  }

  const apiBase = process.env.WINSTALL_API_BASE;
  const apiKey = process.env.WINSTALL_API_KEY;
  const apiSecret = process.env.WINSTALL_API_SECRET;

  if (!apiBase || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Analytics API is not configured." });
  }

  const url = `${apiBase.replace(/\/$/, "")}/analytics/track`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        AuthKey: apiKey,
        AuthSecret: apiSecret,
      },
      body: JSON.stringify({
        event: type,
        targetType: "app",
        targetId: id,
        sessionId,
      }),
    });

    const text = await response.text();
    let data;

    if (!text) {
      data = response.ok
        ? {}
        : { error: response.statusText || "Request failed" };
    } else {
      try {
        data = JSON.parse(text);
      } catch {
        data = response.ok ? { data: text } : { error: text };
      }
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Track request failed" });
  }
}
