// Configure proxy on server-side before any imports
if (typeof window === 'undefined') {
  require('../utils/proxyConfig');
}

import "../styles/base.scss";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

import SelectedContext from "../ctx/SelectedContext";

import { checkTheme } from "../utils/helpers";
import { trackPageLoaded } from "../utils/gtm";
import Nav from "../components/Nav";
import SelectionBar from "../components/SelectionBar";
import PopularContext from "../ctx/PopularContext";
import { AuthGateProvider } from "../ctx/AuthGateContext";
import { SessionProvider } from "next-auth/react";

const SELECTION_STORAGE_KEY = "winstall-selection";

function loadSelectionFromStorage() {
  if (typeof window === "undefined") return { apps: [], options: null };
  
  try {
    const stored = localStorage.getItem(SELECTION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        apps: Array.isArray(parsed.selectedApps) ? parsed.selectedApps : [],
        options: parsed.defaultInstallOptions || null,
      };
    }
  } catch (error) {
    console.error("Failed to load selection from localStorage:", error);
  }
  
  return { apps: [], options: null };
}

function saveSelectionToStorage(selectedApps, defaultInstallOptions) {
  if (typeof window === "undefined") return;
  
  try {
    if (selectedApps.length === 0) {
      localStorage.removeItem(SELECTION_STORAGE_KEY);
    } else {
      localStorage.setItem(
        SELECTION_STORAGE_KEY,
        JSON.stringify({
          selectedApps,
          defaultInstallOptions,
        })
      );
    }
  } catch (error) {
    console.error("Failed to save selection to localStorage:", error);
  }
}

function winstall({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const initialLoad = useRef(true);

  const [selectedApps, setSelectedApps] = useState([]);
  const [defaultInstallOptions, setDefaultInstallOptions] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialLoad.current) {
      const { apps, options } = loadSelectionFromStorage();
      if (apps.length > 0) {
        setSelectedApps(apps);
        setDefaultInstallOptions(options);
      }
      initialLoad.current = false;
    }
  }, []);

  // Save to localStorage when selection changes
  useEffect(() => {
    if (!initialLoad.current) {
      saveSelectionToStorage(selectedApps, defaultInstallOptions);
    }
  }, [selectedApps, defaultInstallOptions]);

  useEffect(() => {
    if (selectedApps.length === 0) {
      setDefaultInstallOptions(null);
    }
  }, [selectedApps.length]);

  const selectedAppValue = {
    selectedApps,
    setSelectedApps,
    defaultInstallOptions,
    setDefaultInstallOptions,
  };

  const [popular, setPopular] = useState([]);
  const popularApps = { popular, setPopular };

  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = (url) => {
      trackPageLoaded(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

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
      <AuthGateProvider>
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
      </AuthGateProvider>
    </SessionProvider>
  );
}

export default winstall;
