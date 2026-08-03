const SESSION_KEY = "winstall_ad_id";

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

export function buildAdHref(ad, placement = "unknown") {
  if (!ad?.targetUrl) return "#";

  const url = new URL(ad.targetUrl);
  url.searchParams.set("utm_source", "winstall.app");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set(
    "utm_campaign",
    `${CAMPAIGN_DATE}_WW_WW_EN_Winstall_${ad.product}_${ad.angle}`
  );
  url.searchParams.set("utm_content", `${placement}-a`);
  return url.toString();
}
