const STATS_META_NAME = "winstall-show-stats";

export function isStatsDisplayEnabledValue(value) {
  if (value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

export function statsDisplayMetaContent() {
  return isStatsDisplayEnabledValue(process.env.WINSTALL_SHOW_STATS) ? "1" : "0";
}

export function isStatsDisplayEnabled() {
  if (typeof window !== "undefined") {
    const content = document
      .querySelector(`meta[name="${STATS_META_NAME}"]`)
      ?.getAttribute("content");
    return content === "1";
  }
  return isStatsDisplayEnabledValue(process.env.WINSTALL_SHOW_STATS);
}
