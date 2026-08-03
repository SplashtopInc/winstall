const STORAGE_KEY = "winstall.recentSearches";
const MAX_RECENT = 5;

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readRecentSearches() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => {
        if (!item || typeof item !== "object") return false;
        if (item.type === "app") return Boolean(item.id && item.name);
        if (item.type === "query") return Boolean(item.text);
        return false;
      })
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeRecentSearches(items) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // Ignore quota / private mode failures.
  }
}

function sameRecentItem(a, b) {
  if (a.type !== b.type) return false;
  if (a.type === "app") return a.id === b.id;
  return a.text.toLowerCase() === b.text.toLowerCase();
}

function pushRecentItem(item) {
  const next = [item, ...readRecentSearches().filter((entry) => !sameRecentItem(entry, item))];
  const limited = next.slice(0, MAX_RECENT);
  writeRecentSearches(limited);
  return limited;
}

export function getRecentSearches() {
  return readRecentSearches();
}

export function addRecentApp({ id, name, icon = "" }) {
  if (!id || !name) return readRecentSearches();
  return pushRecentItem({ type: "app", id, name, icon: icon || "" });
}

export function addRecentQuery(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return readRecentSearches();
  return pushRecentItem({ type: "query", text: trimmed });
}
