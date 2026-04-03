// Configure proxy on server-side before any imports
if (typeof window === 'undefined') {
  require('../utils/proxyConfig');
}

import "../styles/base.scss";
import { useState, useEffect } from "react";

import SelectedContext from "../ctx/SelectedContext";

import { checkTheme } from "../utils/helpers";
import Nav from "../components/Nav";
import SelectionBar from "../components/SelectionBar";
import PopularContext from "../ctx/PopularContext";
import { SessionProvider } from "next-auth/react";

function winstall({ Component, pageProps: { session, ...pageProps } }) {
  const [selectedApps, setSelectedApps] = useState([]);
  const selectedAppValue = { selectedApps, setSelectedApps };

  const [popular, setPopular] = useState([]);
  const popularApps = { popular, setPopular };

  useEffect(() => {
    checkTheme();

    // Force Service Worker update on app load (production only)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          // Force check for updates
          registration.update();

          // Listen for new service worker waiting to activate
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New SW is ready, skip waiting
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  // Reload page to activate
                  window.location.reload();
                }
              });
            }
          });
        });
      });
    }
  }, []);

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
