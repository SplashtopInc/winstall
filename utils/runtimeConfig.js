let _apiBase = null;

export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (_apiBase === null) {
      _apiBase = document.querySelector('meta[name="winstall-api-base"]')?.getAttribute('content') || '';
    }
    return _apiBase;
  }
  return process.env.WINSTALL_API_BASE || process.env.NEXT_PUBLIC_WINSTALL_API_BASE || '';
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
