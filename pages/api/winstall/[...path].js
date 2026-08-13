import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { signJwt } from "../../../utils/signJwt";

const PACK_RESOURCE = /^packs\/[^/]+$/;
const PACK_COPY = /^packs\/[^/]+\/copy$/;

/**
 * Paths that must have a user JWT (session required).
 * @param {string} method
 * @param {string} path - joined API path without leading slash
 */
const requiresAuth = (method, path) => {
  // POST /packs (create)
  if (method === "POST" && path === "packs") return true;

  // Legacy POST /packs/create
  if (method === "POST" && path.startsWith("packs/create")) return true;

  // GET /packs/me
  if (method === "GET" && path === "packs/me") return true;

  // Legacy GET /packs/profile/:id
  if (method === "GET" && path.startsWith("packs/profile/")) return true;

  // PATCH|DELETE /packs/:id
  if (
    (method === "PATCH" || method === "DELETE") &&
    (PACK_RESOURCE.test(path) || path.startsWith("packs/"))
  ) {
    return true;
  }

  // POST /packs/:id/copy
  if (method === "POST" && PACK_COPY.test(path)) return true;

  return false;
};

/**
 * GET /packs/:id — attach JWT when session exists so owners can read private packs.
 * @param {string} method
 * @param {string} path
 */
const prefersOptionalUserJwt = (method, path) => {
  return method === "GET" && PACK_RESOURCE.test(path);
};

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 * @param {Record<string, string>} headers
 * @param {{ required: boolean }} options
 * @returns {Promise<{ ok: true } | { ok: false, status: number, error: string }>}
 */
async function attachUserJwtIfNeeded(req, res, headers, { required }) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    if (required) {
      console.error("[API Proxy] No session or user ID found");
      return { ok: false, status: 401, error: "Authentication required" };
    }
    return { ok: true };
  }

  const userId = session.user.id;
  const jwtPayload = { userId };
  const token = signJwt(jwtPayload);

  if (!token) {
    console.error("[API Proxy] NEXTAUTH_SECRET not configured");
    return { ok: false, status: 500, error: "Server configuration error" };
  }

  // API requireUserId reads jwtPayload (prod Bearer verify) or X-User-Id.
  // In non-production, checkUser skips JWT parse, so X-User-Id is required.
  headers.Authorization = `Bearer ${token}`;
  headers["X-User-Id"] = userId;

  if (process.env.NODE_ENV === "development") {
    const [, payloadB64] = token.split(".");
    let claims = null;
    try {
      claims = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    } catch {
      // ignore decode errors in debug logging
    }
    console.log("\n[API Proxy JWT Debug]");
    console.log(
      "Session User:",
      JSON.stringify(
        {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
        null,
        2
      )
    );
    console.log("JWT Payload:", JSON.stringify(jwtPayload, null, 2));
    console.log("JWT Claims:", JSON.stringify(claims, null, 2));
    console.log("JWT Token (first 50 chars):", token.substring(0, 50) + "...");
    console.log("[API Proxy JWT Debug End]\n");
  }

  return { ok: true };
}

export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join("/") : path;

  const apiBase = process.env.WINSTALL_API_BASE;
  const apiKey = process.env.WINSTALL_API_KEY;
  const apiSecret = process.env.WINSTALL_API_SECRET;

  if (!apiBase) {
    return res.status(500).json({ error: "API base URL not configured" });
  }

  const queryString = req.url?.split("?")[1];
  const url = `${apiBase}/${apiPath}${queryString ? `?${queryString}` : ""}`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (apiKey && apiSecret) {
    headers.AuthKey = apiKey;
    headers.AuthSecret = apiSecret;
  }

  if (requiresAuth(req.method, apiPath)) {
    const authResult = await attachUserJwtIfNeeded(req, res, headers, {
      required: true,
    });
    if (!authResult.ok) {
      return res.status(authResult.status).json({ error: authResult.error });
    }
  } else if (prefersOptionalUserJwt(req.method, apiPath)) {
    const authResult = await attachUserJwtIfNeeded(req, res, headers, {
      required: false,
    });
    if (!authResult.ok) {
      return res.status(authResult.status).json({ error: authResult.error });
    }
  } else if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
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
    return res.status(500).json({ error: error.message });
  }
}
