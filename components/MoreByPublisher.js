import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/appDetail.module.scss";
import RelatedAppCard from "./RelatedAppCard";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";

const MAX_PUBLISHER_APPS = 4;

const MoreByPublisher = ({ publisher, currentAppId }) => {
  const [apps, setApps] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublisherApps = async () => {
      if (!publisher) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { response, error: fetchError } = await fetchWinstallAPI(
          `/publishers/${encodeURIComponent(publisher)}`
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

        const filtered = items.filter((app) => app._id !== currentAppId);
        setTotalCount(filtered.length);

        const limited = filtered.slice(0, MAX_PUBLISHER_APPS);

        limited.forEach((app) => {
          if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
            const iconName = app.icon.replace(".png", "");
            app.iconUrl = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/next/${iconName}.webp`;
            app.iconPng = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/${iconName}.png`;
          }
        });

        setApps(limited);
      } catch (err) {
        setError(err.message || "Failed to load publisher apps");
      } finally {
        setLoading(false);
      }
    };

    fetchPublisherApps();
  }, [publisher, currentAppId]);

  if (loading) {
    return (
      <section className={styles.related} aria-label={`More by ${publisher}`}>
        <div className={styles.relatedHead}>
          <h2 className={styles.relatedTitle}>More by {publisher}</h2>
        </div>
        <p className={styles.relatedLoading}>Loading apps...</p>
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
    <section className={styles.related} aria-label={`More by ${publisher}`}>
      <div className={styles.relatedHead}>
        <h2 className={styles.relatedTitle}>More by {publisher}</h2>
        {totalCount > MAX_PUBLISHER_APPS && (
          <Link
            href={`/apps?q=publisher: ${publisher}`}
            className={styles.relatedMore}
          >
            View All &gt;
          </Link>
        )}
      </div>
      <div className={styles.relGrid}>
        {apps.map((app) => (
          <RelatedAppCard key={app._id} app={app} />
        ))}
      </div>
    </section>
  );
};

export default MoreByPublisher;
