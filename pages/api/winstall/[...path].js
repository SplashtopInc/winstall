import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import jwt from "jsonwebtoken";

/**
 * Check if the request requires authentication
 * @param {string} method - HTTP method
 * @param {string} path - API path
 */
const requiresAuth = (method, path) => {
  // POST to /packs/create
  if (method === 'POST' && path.startsWith('packs/create')) return true;

  // PATCH to /packs/:id (update)
  if (method === 'PATCH' && path.startsWith('packs/')) return true;

  // DELETE to /packs/:id
  if (method === 'DELETE' && path.startsWith('packs/')) return true;

  // GET to /packs/profile/:id (user's packs)
  if (method === 'GET' && path.startsWith('packs/profile/')) return true;

  return false;
};

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

  // For authenticated requests, generate JWT from session
  if (requiresAuth(req.method, apiPath)) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      console.error('[API Proxy] No session or user ID found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Generate JWT token with user ID
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[API Proxy] NEXTAUTH_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const jwtPayload = { userId: session.user.id };
    const token = jwt.sign(
      jwtPayload,
      secret,
      { expiresIn: '5m' } // Short-lived token for API calls
    );

    // Development mode: log JWT generation for testing
    if (process.env.NODE_ENV === 'development') {
      const decoded = jwt.decode(token, { complete: true });
      console.log('\n[API Proxy JWT Debug]');
      console.log('Session User:', JSON.stringify({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      }, null, 2));
      console.log('JWT Payload:', JSON.stringify(jwtPayload, null, 2));
      console.log('JWT Header:', JSON.stringify(decoded.header, null, 2));
      console.log('JWT Claims:', JSON.stringify(decoded.payload, null, 2));
      console.log('JWT Token (first 50 chars):', token.substring(0, 50) + '...');
      console.log('[API Proxy JWT Debug End]\n');
    }

    headers['Authorization'] = `Bearer ${token}`;
  } else if (req.headers.authorization) {
    // For non-authenticated requests, pass through authorization header if present
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
