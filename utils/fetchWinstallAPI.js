/**
 * Helper method for requesting resources from the winstall-api.
 * @param {*} path - path of the resource
 * @param {*} givenOptions - any additional header options
 * @param {*} throwErr - flag to indicate whether an error should be thrown
 * @returns
 */
const fetchWinstallAPI = async (path, givenOptions, throwErr) => {
  const url = `${process.env.NEXT_PUBLIC_WINGET_API_BASE}${path}`;

  let additionalOptions = { ...givenOptions };
  let headerOptions;

  if (additionalOptions) {
    headerOptions = { ...givenOptions?.headers };
    delete additionalOptions["headers"];
  }

  let response, error;

  try {
    const res = await fetch(url, {
      headers: {
        AuthKey: process.env.NEXT_PUBLIC_WINGET_API_KEY,
        AuthSecret: process.env.NEXT_PUBLIC_WINGET_API_SECRET,
        ...headerOptions,
      },
      ...additionalOptions,
      redirect: "follow",
    });


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
    console.error(`[fetchWinstallAPI] request failed ${url}`, err);
    error = err.message;

    // if `throwErr` is true we fail deployments
    if (throwErr) {
      throw new Error(err);
    }
  }

  return { response, error };
};

module.exports = fetchWinstallAPI;
