// Public runtime configuration endpoint (non-sensitive data only)
export default function handler(req, res) {
  const apiBase = process.env.NEXT_PUBLIC_WINSTALL_API_BASE || process.env.WINSTALL_API_BASE;

  if (!apiBase) {
    return res.status(500).json({
      error: 'API base URL not configured',
      message: 'Please set NEXT_PUBLIC_WINSTALL_API_BASE or WINSTALL_API_BASE in environment'
    });
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).json({
    apiBase,
    timestamp: new Date().toISOString()
  });
}
