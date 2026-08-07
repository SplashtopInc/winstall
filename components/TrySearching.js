import { useState, useEffect } from "react";
import detailStyles from "../styles/appDetail.module.scss";
import RelatedAppCard from "./RelatedAppCard";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import { getIconBase } from "../utils/runtimeConfig";

const MAX_SUGGESTIONS = 4;

function normalizeApps(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.items)) return response.items;
  if (response && Array.isArray(response.apps)) return response.apps;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

function withIconUrls(apps) {
  return apps.map((app) => {
    if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
      const iconName = app.icon.replace(".png", "");
      return {
        ...app,
        iconUrl: `${getIconBase()}/icons/next/${iconName}.webp`,
        iconPng: `${getIconBase()}/icons/${iconName}.png`,
      };
    }
    return app;
  });
}

function TrySearching({ query, className }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(Boolean(query && String(query).trim()));

  useEffect(() => {
    const q = query && String(query).trim();
    if (!q) {
      setLoading(false);
      setApps([]);
      return;
    }

    let cancelled = false;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const { response, error } = await fetchWinstallAPI(
          `/apps/related?q=${encodeURIComponent(q)}`
        );

        if (cancelled) return;

        if (error) {
          setApps([]);
          return;
        }

        setApps(withIconUrls(normalizeApps(response).slice(0, MAX_SUGGESTIONS)));
      } catch {
        if (!cancelled) setApps([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!loading && apps.length === 0) {
    return null;
  }

  return (
    <section
      className={`${detailStyles.related}${className ? ` ${className}` : ""}`}
      aria-label="Try searching"
    >
      <div className={detailStyles.relatedHead}>
        <h2 className={detailStyles.relatedTitle}>Try searching</h2>
      </div>
      {loading ? (
        <p className={detailStyles.relatedLoading}>Finding similar apps...</p>
      ) : (
        <div className={detailStyles.relGrid}>
          {apps.map((app) => (
            <RelatedAppCard key={app._id} app={app} />
          ))}
        </div>
      )}
    </section>
  );
}

export default TrySearching;
