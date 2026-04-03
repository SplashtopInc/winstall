export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  const apiBase = process.env.WINSTALL_API_BASE;
  const apiKey = process.env.WINSTALL_API_KEY;
  const apiSecret = process.env.WINSTALL_API_SECRET;

  if (!apiBase) {
    return res.status(500).json({ error: 'API base URL not configured' });
  }

  const queryString = req.url?.split('?')[1];
  const url = `${apiBase}/${apiPath}${queryString ? `?${queryString}` : ''}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey && apiSecret) {
    headers['AuthKey'] = apiKey;
    headers['AuthSecret'] = apiSecret;
  }

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    // Use global fetch - smart proxy dispatcher handles NO_PROXY automatically
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
