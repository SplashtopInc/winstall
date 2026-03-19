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
  const url = `${config.apiBase}${path}`;
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

    const res = await fetch(url, {
      headers: {
        AuthKey: config.apiKey,
        AuthSecret: config.apiSecret,
        ...headerOptions,
      },
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
    const isConnRefused = err?.cause?.code === "ECONNREFUSED";
    const isBuildTime = process.env.NODE_ENV === "production" && !process.env.PORT;

    // During Docker build, API is unavailable. Return empty data instead of failing.
    if (isConnRefused && isBuildTime) {
      console.warn(`[fetchWinstallAPI] build-time: API unavailable, returning empty data for ${url}`);
      return { response: null, error: null };
    }

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
