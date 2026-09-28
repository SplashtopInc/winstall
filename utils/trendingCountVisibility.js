/** Minimum lifetime count shown on home Trending Apps cards. */
export const TRENDING_COUNT_MIN_VISIBLE = 100;

/**
 * Whether a trending lifetime count is high enough to show.
 * Missing / non-numeric values are treated as not visible.
 *
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isTrendingCountVisible(raw) {
  const value = Number(raw);
  return Number.isFinite(value) && value >= TRENDING_COUNT_MIN_VISIBLE;
}
