import { getRuntimeConfig } from "./runtimeConfig";

const PACK_RESOURCE = /^\/packs\/[^/]+$/;
const PACK_COPY = /^\/packs\/[^/]+\/copy$/;

function splitPath(path) {
  const raw = path == null ? "" : String(path);
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const q = withSlash.indexOf("?");
  const pathname = (q === -1 ? withSlash : withSlash.slice(0, q)).replace(/\/$/, "") || "/";
  return { pathname };
}

function requiresUserJwt(method, pathname) {
  if (method === "POST" && pathname === "/packs") return true;
  if (method === "GET" && pathname === "/packs/me") return true;
  if ((method === "PATCH" || method === "DELETE") && PACK_RESOURCE.test(pathname)) {
    return true;
  }
  if (method === "POST" && PACK_COPY.test(pathname)) return true;
  return false;
}

function prefersOptionalUserJwt(method, pathname) {
  return method === "GET" && PACK_RESOURCE.test(pathname);
}

function isApiTokenFresh(session) {
  if (!session?.apiToken) return false;
  const exp = Number(session.apiTokenExpires) || 0;
  return exp - Math.floor(Date.now() / 1000) > 0;
}

async function getBrowserSession() {
  if (typeof window === "undefined") return null;
  const { getSession } = await import("next-auth/react");
  return getSession();
}

async function authHeaders(method, pathname) {
  if (typeof window === "undefined") return {};
  const required = requiresUserJwt(method, pathname);
  const optional = prefersOptionalUserJwt(method, pathname);
  if (!required && !optional) return {};

  const session = await getBrowserSession();
  if (required && session?.apiToken) {
    return { Authorization: `Bearer ${session.apiToken}` };
  }
  if (optional && isApiTokenFresh(session)) {
    return { Authorization: `Bearer ${session.apiToken}` };
  }
  return {};
}

/**
 * Helper method for requesting resources from the winstall-api.
 * @param {*} path - path of the resource
 * @param {*} givenOptions - any additional header options
 * @param {*} throwErr - flag to indicate whether an error should be thrown
 * @returns
 */
const fetchWinstallAPI = async (path, givenOptions, throwErr) => {
  const config = await getRuntimeConfig();
  const apiBase = (config.apiBase || "").replace(/\/$/, "");

  if (!apiBase) {
    console.warn(`[fetchWinstallAPI] no API configured, skipping ${path}`);
    return { response: null, error: null, status: null };
  }

  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${apiBase}${urlPath}`;
  const isDebug = process.env.WINSTALL_API_DEBUG === "1";
  const timeoutMs = Number(process.env.WINSTALL_API_TIMEOUT_MS || 15000);
  const method = (givenOptions?.method || "GET").toUpperCase();
  const { pathname } = splitPath(urlPath);
  const canRetryAuth = typeof window !== "undefined" && requiresUserJwt(method, pathname);

  let additionalOptions = { ...givenOptions };
  let headerOptions;

  if (additionalOptions) {
    headerOptions = { ...givenOptions?.headers };
    delete additionalOptions["headers"];
  }

  let response, error, status;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const headers = {
        ...headerOptions,
        ...(await authHeaders(method, pathname)),
      };

      if (isDebug) {
        console.log(`[fetchWinstallAPI] request ${method} ${url} (timeout ${timeoutMs}ms)`);
      }

      const res = await fetch(url, {
        ...additionalOptions,
        method,
        headers,
        credentials: "omit",
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal,
      });

      status = res.status;

      if (isDebug) {
        const elapsedMs = Date.now() - startedAt;
        console.log(`[fetchWinstallAPI] response ${res.status} ${res.statusText} ${url} (${elapsedMs}ms)`);
      }

      if (res.status === 401 && canRetryAuth && attempt === 0) {
        await getBrowserSession();
        continue;
      }

      if (!res.ok) {
        let errorBody;
        const contentType = res.headers.get("content-type");

        try {
          if (contentType && contentType.includes("application/json")) {
            errorBody = await res.json();
            error = errorBody.error || errorBody.message || res.statusText;
          } else {
            const textBody = await res.text();
            error = textBody || res.statusText;
            errorBody = { error: textBody };
          }
        } catch {
          error = res.statusText;
          errorBody = { error: res.statusText };
        }

        console.error(`[fetchWinstallAPI] ${res.status} ${res.statusText} ${url}`, errorBody);

        if (throwErr) {
          throw new Error(error);
        }
      } else {
        response = await res.json();
      }
      break;
    }
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const errName = err?.name || "Error";

    console.error(`[fetchWinstallAPI] request failed ${url} (${elapsedMs}ms)`, err);
    error = errName === "AbortError" ? `Request timed out after ${timeoutMs}ms` : err.message;

    if (throwErr) {
      throw new Error(err);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return { response, error, status };
};

export default fetchWinstallAPI;
