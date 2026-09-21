const DEFAULT_APPS_SEARCH_HINT = "Search apps...";

/**
 * Build the global nav search trigger hint from a catalog total.
 * Rounds down to a multiple of 50 to match the former home count line.
 */
export function formatAppsSearchHint(appsTotal) {
  const total = Number(appsTotal);
  if (!Number.isFinite(total) || total <= 0) {
    return DEFAULT_APPS_SEARCH_HINT;
  }

  const rounded = Math.floor(total / 50) * 50;
  if (rounded <= 0) {
    return DEFAULT_APPS_SEARCH_HINT;
  }

  return `Search ${rounded.toLocaleString("en-US")}+ apps`;
}

export { DEFAULT_APPS_SEARCH_HINT };
