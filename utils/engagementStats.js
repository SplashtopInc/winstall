export function formatCount(count) {
  if (count == null || Number.isNaN(Number(count))) return null;
  const value = Number(count);
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

export function mapStatsPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    views: Number(raw.viewCount) || 0,
    downloads: Number(raw.downloadCount) || 0,
    likeCount: Number(raw.likeCount) || 0,
    liked: raw.liked === true,
  };
}
