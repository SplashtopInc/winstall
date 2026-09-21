const COMPACT_UNITS = [
  { unit: 1e3, suffix: "K" },
  { unit: 1e6, suffix: "M" },
  { unit: 1e9, suffix: "B" },
];

export function formatCount(count) {
  if (count == null || Number.isNaN(Number(count))) return null;
  const value = Number(count);
  if (value < 1000) return String(value);

  let unit = COMPACT_UNITS[0].unit;
  let suffix = COMPACT_UNITS[0].suffix;
  for (const step of COMPACT_UNITS) {
    if (value >= step.unit) {
      unit = step.unit;
      suffix = step.suffix;
    }
  }

  let scaled = Number((value / unit).toFixed(1));
  const next = COMPACT_UNITS.find((step) => step.unit === unit * 1000);
  if (scaled >= 1000 && next) {
    unit = next.unit;
    suffix = next.suffix;
    scaled = Number((value / unit).toFixed(1));
  }

  return `${String(scaled).replace(/\.0$/, "")}${suffix}`;
}

export function mapStatsPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    views: Number(raw.viewCount) || 0,
    downloads: Number(raw.downloadCount) || 0,
    likeCount: Number(raw.likeCount) || 0,
  };
}

export function mapLikePayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    liked: raw.liked === true,
    likeCount: Number(raw.likeCount) || 0,
  };
}
