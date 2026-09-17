let _iconBase = null;
let _apiBase = null;
let _showViewsInstalls = null;

const OFF_VALUES = new Set(["0", "false", "off", "no"]);
const ON_VALUES = new Set(["1", "true", "on", "yes"]);

/** Unset / empty defaults to on. Recognizes 1/true/on/yes and 0/false/off/no. */
export function parseOnOffEnv(value, defaultOn = true) {
  if (value == null) return defaultOn;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return defaultOn;
  if (OFF_VALUES.has(normalized)) return false;
  if (ON_VALUES.has(normalized)) return true;
  return defaultOn;
}

export const SHOW_VIEWS_INSTALLS_META = "winstall-show-views-installs";

const trimEnv = (value) => String(value || "").trim();

export const getIconBase = () => {
  if (typeof window !== 'undefined') {
    if (_iconBase === null) {
      _iconBase = document.querySelector('meta[name="winstall-icon-base"]')?.getAttribute('content') || '';
    }
    return _iconBase;
  }
  return process.env.WINSTALL_ICON_BASE || '';
};

/** Browser-facing API origin (`WINSTALL_API_BASE`). Used by `_document` and ISR. */
export const getPublicApiBase = () => trimEnv(process.env.WINSTALL_API_BASE);

const readApiBase = () => {
  if (typeof window !== 'undefined') {
    if (_apiBase === null) {
      _apiBase = document.querySelector('meta[name="winstall-api-base"]')?.getAttribute('content') || '';
    }
    return _apiBase;
  }
  const internalBase = trimEnv(process.env.WINSTALL_API_INTERNAL_BASE);
  if (internalBase) return internalBase;
  return getPublicApiBase();
};

export const isShowViewsInstalls = () => {
  if (typeof window !== "undefined") {
    if (_showViewsInstalls === null) {
      const raw = document
        .querySelector(`meta[name="${SHOW_VIEWS_INSTALLS_META}"]`)
        ?.getAttribute("content");
      _showViewsInstalls = parseOnOffEnv(raw, true);
    }
    return _showViewsInstalls;
  }
  return parseOnOffEnv(process.env.WINSTALL_SHOW_VIEWS_INSTALLS, true);
};

export const getRuntimeConfig = async () => {
  return {
    apiBase: readApiBase(),
  };
};
