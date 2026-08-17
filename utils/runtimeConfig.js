let _iconBase = null;
let _apiBase = null;

export const getIconBase = () => {
  if (typeof window !== 'undefined') {
    if (_iconBase === null) {
      _iconBase = document.querySelector('meta[name="winstall-icon-base"]')?.getAttribute('content') || '';
    }
    return _iconBase;
  }
  return process.env.WINSTALL_ICON_BASE || '';
};

const readApiBase = () => {
  if (typeof window !== 'undefined') {
    if (_apiBase === null) {
      _apiBase = document.querySelector('meta[name="winstall-api-base"]')?.getAttribute('content') || '';
    }
    return _apiBase;
  }
  return process.env.WINSTALL_API_BASE || '';
};

export const getRuntimeConfig = async () => {
  return {
    apiBase: readApiBase(),
  };
};
