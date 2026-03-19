let cachedConfig = null;

export const getRuntimeConfig = async () => {
  if (typeof window === 'undefined') {
    // Server-side: use env directly
    return {
      apiBase: process.env.WINSTALL_API_BASE || '',
      apiKey: process.env.WINSTALL_API_KEY || '',
      apiSecret: process.env.WINSTALL_API_SECRET || '',
    };
  }

  // Client-side: fetch once and cache
  if (cachedConfig) return cachedConfig;

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      cachedConfig = await res.json();
      return cachedConfig;
    }
  } catch (err) {
    console.error('[runtimeConfig] Failed to fetch config:', err);
  }

  // Fallback to empty
  cachedConfig = { apiBase: '', apiKey: '', apiSecret: '' };
  return cachedConfig;
};
