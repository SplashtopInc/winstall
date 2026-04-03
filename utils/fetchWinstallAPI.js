import { getRuntimeConfig } from "./runtimeConfig";

/**
 * Helper method for requesting resources from the winstall-api.
 * @param {*} path - path of the resource
 * @param {*} givenOptions - any additional header options
 * @param {*} throwErr - flag to indicate whether an error should be thrown
 * @returns
 */
const fetchWinstallAPI = async (path, givenOptions, throwErr) => {
  const config = await getRuntimeConfig();

  // Client-side routing logic:
  // - All client requests go through proxy (/api/winstall)
  // - Server-side: direct API access with auth headers
  const isClientSide = typeof window !== 'undefined';
  const useProxy = isClientSide;

  // Client-side always uses proxy, doesn't need apiBase
  if (!useProxy && !config.apiBase) {
    console.warn(`[fetchWinstallAPI] no API configured, skipping ${path}`);
    return { response: null, error: null };
  }

  const url = useProxy ? `/api/winstall${path}` : `${config.apiBase}${path}`;
  const isDebug = process.env.WINSTALL_API_DEBUG === "1";
  const timeoutMs = Number(process.env.WINSTALL_API_TIMEOUT_MS || 15000);
  const method = givenOptions?.method || "GET";

  let additionalOptions = { ...givenOptions };
  let headerOptions;

  if (additionalOptions) {
    headerOptions = { ...givenOptions?.headers };
    delete additionalOptions["headers"];
  }

  let response, error;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (isDebug) {
      console.log(`[fetchWinstallAPI] request ${method} ${url} (timeout ${timeoutMs}ms)`);
    }

    const headers = { ...headerOptions };

    // Only add auth headers on server-side (client uses proxy for authenticated requests)
    if (!isClientSide && config.apiKey && config.apiSecret) {
      headers.AuthKey = config.apiKey;
      headers.AuthSecret = config.apiSecret;
    }

    // Use global fetch - smart proxy dispatcher handles NO_PROXY automatically
    const res = await fetch(url, {
      headers,
      ...additionalOptions,
      redirect: "follow",
      signal: controller.signal,
    });

    if (isDebug) {
      const elapsedMs = Date.now() - startedAt;
      console.log(`[fetchWinstallAPI] response ${res.status} ${res.statusText} ${url} (${elapsedMs}ms)`);
    }


    if (!res.ok) {
      let errorBody;
      const contentType = res.headers.get('content-type');

      try {
        // Only try to parse JSON if content-type indicates JSON
        if (contentType && contentType.includes('application/json')) {
          errorBody = await res.json();
          error = errorBody.error || errorBody.message || res.statusText;
        } else {
          // For non-JSON responses (like plain text error messages)
          const textBody = await res.text();
          error = textBody || res.statusText;
          errorBody = { error: textBody };
        }
      } catch (parseErr) {
        // If parsing fails, use status text as error
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

  return { response, error };
};

export default fetchWinstallAPI;
