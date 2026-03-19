export default function handler(req, res) {
  res.status(200).json({
    apiBase: process.env.WINSTALL_API_BASE || '',
    apiKey: process.env.WINSTALL_API_KEY || '',
    apiSecret: process.env.WINSTALL_API_SECRET || '',
  });
}
