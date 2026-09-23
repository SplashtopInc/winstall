import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import fetchWinstallAPI from "../utils/fetchWinstallAPI";

const APPS_TOTAL_STORAGE_KEY = "winstall-apps-total";

const AppsTotalContext = createContext({
  appsTotal: 0,
  setAppsTotal: () => {},
});

function readEnvelopeTotal(payload) {
  if (!payload || typeof payload !== "object") return 0;
  return typeof payload.total === "number" && payload.total > 0
    ? payload.total
    : 0;
}

function readCachedTotal() {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(sessionStorage.getItem(APPS_TOTAL_STORAGE_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeCachedTotal(total) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(APPS_TOTAL_STORAGE_KEY, String(total));
  } catch {
    // ignore quota / private mode
  }
}

export function AppsTotalProvider({ children }) {
  const [appsTotal, setAppsTotalState] = useState(0);

  const setAppsTotal = useCallback((next) => {
    const n = Number(next);
    if (!Number.isFinite(n) || n <= 0) return;
    setAppsTotalState((prev) => (prev === n ? prev : n));
    writeCachedTotal(n);
  }, []);

  // Restore last known catalog total for any entry route (not just home).
  useEffect(() => {
    const cached = readCachedTotal();
    if (cached > 0) {
      setAppsTotalState((prev) => (prev > 0 ? prev : cached));
    }
  }, []);

  // Cold entry: one cheap list request for the envelope total when still unknown.
  useEffect(() => {
    if (appsTotal > 0) return;

    let cancelled = false;

    (async () => {
      const { response } = await fetchWinstallAPI("/apps?offset=0&limit=1");
      if (cancelled) return;
      const total = readEnvelopeTotal(response);
      if (total > 0) {
        setAppsTotalState(total);
        writeCachedTotal(total);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appsTotal]);

  const value = useMemo(
    () => ({
      appsTotal,
      setAppsTotal,
    }),
    [appsTotal, setAppsTotal]
  );

  return (
    <AppsTotalContext.Provider value={value}>
      {children}
    </AppsTotalContext.Provider>
  );
}

export function useAppsTotal() {
  return useContext(AppsTotalContext);
}

export default AppsTotalContext;
