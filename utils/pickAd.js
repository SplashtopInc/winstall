const SESSION_KEY = "winstall_ad_id";
const BANNER_SESSION_KEY = "winstall_home_banner_ad_ids";
const BANNER_AD_COUNT = 2;

/** Campaign start date (YYMMDD). Fixed for a variant's whole run. */
const CAMPAIGN_DATE = "260731";

export function getEnabledAds(ads) {
  return (ads || []).filter((ad) => ad && ad.enabled !== false);
}

export function pickAd(ads) {
  const pool = getEnabledAds(ads);
  if (typeof window === "undefined" || pool.length === 0) return null;

  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached) {
    const found = pool.find((ad) => ad.id === cached);
    if (found) return found;
  }

  const ad = pool[Math.floor(Math.random() * pool.length)];
  sessionStorage.setItem(SESSION_KEY, ad.id);
  return ad;
}

/**
 * Pick up to `count` enabled ads without replacement for the home banner.
 * Uses a separate session key from shelf `pickAd`.
 * @returns {object[]} empty on server / empty pool
 */
export function pickHomeBannerAds(ads, count = BANNER_AD_COUNT) {
  const pool = getEnabledAds(ads);
  if (typeof window === "undefined" || pool.length === 0) return [];

  const limit = Math.max(0, Math.min(count, pool.length));
  if (limit === 0) return [];

  try {
    const cached = sessionStorage.getItem(BANNER_SESSION_KEY);
    if (cached) {
      const ids = JSON.parse(cached);
      if (Array.isArray(ids) && ids.length > 0) {
        const restored = ids
          .map((id) => pool.find((ad) => ad.id === id))
          .filter(Boolean);
        if (restored.length > 0) {
          return restored.slice(0, limit);
        }
      }
    }
  } catch {
    // ignore bad cache
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  const selected = shuffled.slice(0, limit);
  try {
    sessionStorage.setItem(
      BANNER_SESSION_KEY,
      JSON.stringify(selected.map((ad) => ad.id))
    );
  } catch {
    // ignore quota / private mode
  }
  return selected;
}

export function buildAdHref(ad, placement = "unknown", contentSuffix = "a") {
  if (!ad?.targetUrl) return "#";

  const url = new URL(ad.targetUrl);
  url.searchParams.set("utm_source", "winstall.app");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set(
    "utm_campaign",
    `${CAMPAIGN_DATE}_WW_WW_EN_Winstall_${ad.product}_${ad.angle}`
  );
  url.searchParams.set("utm_content", `${placement}-${contentSuffix}`);
  return url.toString();
}

export { BANNER_AD_COUNT, BANNER_SESSION_KEY };
