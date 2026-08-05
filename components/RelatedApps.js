import { useState, useEffect } from "react";
import styles from "../styles/appDetail.module.scss";
import RelatedAppCard from "./RelatedAppCard";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";

const MAX_RELATED = 4;

const RelatedApps = ({ appId }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedApps = async () => {
      try {
        setLoading(true);
        const { response, error: fetchError } = await fetchWinstallAPI(
          `/apps/related/${appId}?limit=${MAX_RELATED}`
        );

        if (fetchError) {
          setError(fetchError);
          return;
        }

        let items = [];

        if (Array.isArray(response)) {
          items = response;
        } else if (response && Array.isArray(response.items)) {
          items = response.items;
        } else if (response && Array.isArray(response.apps)) {
          items = response.apps;
        } else if (response && Array.isArray(response.data)) {
          items = response.data;
        }

        items = items.slice(0, MAX_RELATED);

        items.forEach((app) => {
          if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
            const iconName = app.icon.replace(".png", "");
            app.iconUrl = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/next/${iconName}.webp`;
            app.iconPng = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/${iconName}.png`;
          }
        });

        setApps(items);
      } catch (err) {
        setError(err.message || "Failed to load related apps");
      } finally {
        setLoading(false);
      }
    };

    if (appId) {
      fetchRelatedApps();
    }
  }, [appId]);

  if (loading) {
    return (
      <section className={styles.related} aria-label="Related apps">
        <div className={styles.relatedHead}>
          <h2 className={styles.relatedTitle}>Related apps</h2>
        </div>
        <p className={styles.relatedLoading}>Loading related apps...</p>
      </section>
    );
  }

  if (error) {
    return null;
  }

  if (!apps || apps.length === 0) {
    return null;
  }

  return (
    <section className={styles.related} aria-label="Related apps">
      <div className={styles.relatedHead}>
        <h2 className={styles.relatedTitle}>Related apps</h2>
      </div>
      <div className={styles.relGrid}>
        {apps.map((app) => (
          <RelatedAppCard key={app._id} app={app} />
        ))}
      </div>
    </section>
  );
};

export default RelatedApps;
