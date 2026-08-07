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
  // Server-side (SSR/ISR): returns full config with apiBase, apiKey, apiSecret
  // Client-side: returns empty strings (process.env.WINSTALL_API_* are undefined)
  // Note: fetchWinstallAPI ignores these values on client-side, uses proxy instead
  return {
    apiBase: process.env.WINSTALL_API_BASE || '',
    apiKey: process.env.WINSTALL_API_KEY || '',
    apiSecret: process.env.WINSTALL_API_SECRET || '',
  };
};
