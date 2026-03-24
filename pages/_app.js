import "../styles/base.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import SelectedContext from "../ctx/SelectedContext";

import { checkTheme } from "../utils/helpers";
import { trackPageView } from "../utils/gtm";
import Nav from "../components/Nav";
import SelectionBar from "../components/SelectionBar";
import PopularContext from "../ctx/PopularContext";
import { SessionProvider } from "next-auth/react";

function winstall({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  const [selectedApps, setSelectedApps] = useState([]);
  const selectedAppValue = { selectedApps, setSelectedApps };

  const [popular, setPopular] = useState([]);
  const popularApps = { popular, setPopular };

  useEffect(() => {
    checkTheme();

    // Track page views on route change
    const handleRouteChange = (url) => {
      trackPageView(url);
    };

    // Trigger initial pageview
    trackPageView(router.pathname);

    // Subscribe to route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup subscription on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.pathname]);

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <SelectedContext.Provider value={selectedAppValue}>
        <PopularContext.Provider value={popularApps}>
          <>
            <div className="container">
              <Nav />
              <Component {...pageProps} />
            </div>
            <SelectionBar />
          </>
        </PopularContext.Provider>
      </SelectedContext.Provider>
    </SessionProvider>
  );
}

export default winstall;
