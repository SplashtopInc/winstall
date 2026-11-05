const FEEDBACKS_PATH = "/feedbacks";

/**
 * True when a missing or expired API JWT must be omitted rather than sent.
 * POST /feedbacks is optional: a stale Bearer is rejected and nothing is stored.
 * @param {string} method
 * @param {string} pathname
 */
export function isOptionalUserJwtRequest(method, pathname) {
  return method === "POST" && pathname === FEEDBACKS_PATH;
}

/**
 * @param {{ apiToken?: string, apiTokenExpires?: number } | null | undefined} session
 */
export function isApiTokenFresh(session) {
  if (!session?.apiToken) return false;
  const exp = Number(session.apiTokenExpires) || 0;
  return exp - Math.floor(Date.now() / 1000) > 0;
}

/**
 * Authorization header for one request.
 * Required writes send any stored token. Optional writes send only a fresh token.
 * @param {{ apiToken?: string, apiTokenExpires?: number } | null | undefined} session
 * @param {{ required?: boolean, optional?: boolean }} mode
 * @returns {{ Authorization?: string }}
 */
export function authorizationFromSession(session, { required = false, optional = false } = {}) {
  if (required && session?.apiToken) {
    return { Authorization: `Bearer ${session.apiToken}` };
  }
  if (optional && isApiTokenFresh(session)) {
    return { Authorization: `Bearer ${session.apiToken}` };
  }
  return {};
}
