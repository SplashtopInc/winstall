/**
 * @returns {Promise<{ response: any, error: string | null }>}
 */
export async function deleteAccount() {
  const timeoutMs = 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response = null;
  let error = null;

  try {
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      try {
        const errorBody = await res.json();
        error = errorBody.error || errorBody.message || res.statusText;
      } catch {
        error = res.statusText;
      }
    } else {
      response = await res.json();
    }
  } catch (err) {
    error =
      err?.name === "AbortError"
        ? `Request timed out after ${timeoutMs}ms`
        : err.message;
  } finally {
    clearTimeout(timeoutId);
  }

  return { response, error };
}
