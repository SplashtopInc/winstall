import { createContext, useContext, useMemo, useState } from "react";

const AppsTotalContext = createContext({
  appsTotal: 0,
  setAppsTotal: () => {},
});

export function AppsTotalProvider({ children }) {
  const [appsTotal, setAppsTotal] = useState(0);
  const value = useMemo(
    () => ({
      appsTotal,
      setAppsTotal,
    }),
    [appsTotal]
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
