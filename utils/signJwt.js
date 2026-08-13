import jwt from "jsonwebtoken";

/**
 * Sign a JWT with NEXTAUTH_SECRET (or an explicit secret).
 * Default expiry is 5 minutes — suitable for BFF → API hops.
 *
 * @param {Record<string, unknown>} payload
 * @param {{ expiresIn?: string | number, secret?: string }} [options]
 * @returns {string | null} Signed token, or null if secret/payload is missing
 */
export function signJwt(payload, options = {}) {
  const secret = options.secret ?? process.env.NEXTAUTH_SECRET;
  if (!secret || payload == null || typeof payload !== "object") {
    return null;
  }

  const expiresIn = options.expiresIn ?? "5m";
  return jwt.sign(payload, secret, { expiresIn });
}
