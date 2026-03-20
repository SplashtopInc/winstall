// In-memory cache for revalidate state
const revalidateState = {};

/**
 * Get exponential backoff revalidate time based on consecutive failures
 * @param {string} key - Cache key (e.g., 'index')
 * @param {boolean} success - Whether the current fetch succeeded
 * @returns {number} Revalidate time in seconds
 */
export function getRevalidateTime(key, success) {
  const entry = revalidateState[key] || { failures: 0, lastFailure: 0 };

  if (success) {
    // Reset on success
    delete revalidateState[key];
    return 600; // Normal revalidate time when data is available
  }

  // Increment failure count
  entry.failures = (entry.failures || 0) + 1;
  entry.lastFailure = Date.now();
  revalidateState[key] = entry;

  // Exponential backoff: 1, 2, 4, 8, 16, 32, 60 (capped)
  const revalidate = Math.min(Math.pow(2, entry.failures - 1), 60);

  console.warn(`[revalidateCache] ${key}: failure #${entry.failures}, revalidate=${revalidate}s`);

  return revalidate;
}
