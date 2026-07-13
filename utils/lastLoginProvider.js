const STORAGE_KEY = "winstallLastLoginProvider";

const VALID_PROVIDERS = new Set(["google", "github", "azure-ad", "twitter"]);

export function getLastLoginProvider() {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(STORAGE_KEY);
  return VALID_PROVIDERS.has(value) ? value : null;
}

export function setLastLoginProvider(provider) {
  if (typeof window === "undefined" || !VALID_PROVIDERS.has(provider)) return;
  localStorage.setItem(STORAGE_KEY, provider);
}
