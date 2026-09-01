const DEFAULT_ACCENT = "#5b8def";

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function parseHexColor(hex) {
  const raw = String(hex || "")
    .replace("#", "")
    .trim();
  if (raw.length === 3) {
    return [
      parseInt(raw[0] + raw[0], 16),
      parseInt(raw[1] + raw[1], 16),
      parseInt(raw[2] + raw[2], 16),
    ];
  }
  if (raw.length !== 6 || Number.isNaN(Number.parseInt(raw, 16))) {
    return null;
  }
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

export function toHexColor([r, g, b]) {
  return `#${[r, g, b]
    .map((n) => clampByte(n).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Soft wash tint from an icon color; lift very dark brands so the card stays pastel. */
export function storyWashTint(iconHex, fallback = DEFAULT_ACCENT) {
  let rgb = parseHexColor(iconHex);
  if (!rgb) rgb = parseHexColor(fallback) || [91, 141, 239];

  let [r, g, b] = rgb;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  if (luminance < 0.28) {
    const lift = 0.28 - luminance;
    const amount = 0.45 + lift;
    r = r + (255 - r) * amount;
    g = g + (255 - g) * amount;
    b = b + (255 - b) * amount;
  } else if (luminance > 0.82) {
    r *= 0.72;
    g *= 0.72;
    b *= 0.72;
  }

  return toHexColor([r, g, b]);
}

/**
 * Sample a vivid average color from an already-decoded HTMLImageElement.
 * Skips near-transparent / near-white / near-black pixels.
 */
export function sampleAccentFromImage(image) {
  if (!image || !image.naturalWidth || !image.naturalHeight) return null;

  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  try {
    context.drawImage(image, 0, 0, size, size);
    const { data } = context.getImageData(0, 0, size, size);
    let r = 0;
    let g = 0;
    let b = 0;
    let weight = 0;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 32) continue;

      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];
      const max = Math.max(pr, pg, pb);
      const min = Math.min(pr, pg, pb);
      if (max < 28 || min > 240) continue;

      const sat = max === 0 ? 0 : (max - min) / max;
      const w = 0.35 + sat;
      r += pr * w;
      g += pg * w;
      b += pb * w;
      weight += w;
    }

    if (weight < 1) return null;
    return toHexColor([r / weight, g / weight, b / weight]);
  } catch {
    return null;
  }
}

export function loadImageAccent(src) {
  if (!src || typeof window === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(sampleAccentFromImage(image));
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export { DEFAULT_ACCENT };
