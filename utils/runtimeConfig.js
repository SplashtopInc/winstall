let _iconBase = null;

export const getIconBase = () => {
  if (typeof window !== 'undefined') {
    if (_iconBase === null) {
      _iconBase = document.querySelector('meta[name="winstall-icon-base"]')?.getAttribute('content') || '';
    }
    return _iconBase;
  }
  return process.env.WINSTALL_ICON_BASE || '';
};

export const getRuntimeConfig = async () => {
  // Server-side (SSR/ISR): apiBase for direct API access
  // Client-side: empty (process.env.WINSTALL_API_* are undefined); fetchWinstallAPI uses the proxy
  return {
    apiBase: process.env.WINSTALL_API_BASE || '',
  };
};
