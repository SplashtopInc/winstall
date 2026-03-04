/**
 * Helper method for requesting resources from the winstall-api.
 * @param {*} path - path of the resource
 * @param {*} givenOptions - any additional header options
 * @param {*} throwErr - flag to indicate whether an error should be thrown
 * @returns
 */
const fetchWinstallAPI = async (path, givenOptions, throwErr) => {
  const url = `${process.env.NEXT_PUBLIC_WINGET_API_BASE}${path}`;
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
        AuthKey: process.env.NEXT_PUBLIC_WINGET_API_KEY,
        AuthSecret: process.env.NEXT_PUBLIC_WINGET_API_SECRET,
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
      // if `throwErr` is true we fail deployments
      if (throwErr) {
        errorBody = await res.json();
        console.error(`[fetchWinstallAPI] ${res.status} ${res.statusText} ${url}`, errorBody);
        throw new Error(errorBody.error);
      }

      errorBody = await res.json();
      console.error(`[fetchWinstallAPI] ${res.status} ${res.statusText} ${url}`, errorBody);
      error = errorBody.error;
    } else {
      response = await res.json();
    }
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const errName = err?.name || "Error";
    console.error(`[fetchWinstallAPI] request failed ${url} (${elapsedMs}ms)`, err);
    error = errName === "AbortError" ? `Request timed out after ${timeoutMs}ms` : err.message;

    // if `throwErr` is true we fail deployments
    if (throwErr) {
      throw new Error(err);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return { response, error };
};

module.exports = fetchWinstallAPI;
