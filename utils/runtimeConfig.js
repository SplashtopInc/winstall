let _iconBase = null;
let _apiBase = null;

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

export const getRuntimeConfig = async () => {
  return {
    apiBase: readApiBase(),
  };
};
