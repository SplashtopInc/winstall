import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/apps.module.scss";
import SingleApp from "./SingleApp";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";

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

        // Normalize response structure
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

        // Filter out current app
        const filtered = items.filter((app) => app._id !== currentAppId);
        setTotalCount(filtered.length);

        // Limit to 8 for display
        const limited = filtered.slice(0, 8);

        // Transform icons to full URLs
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
      <div className="homeBlock">
        <div className="box">
          <h2 className="blockHeader" style={{ display: 'inline-block' }}>More by {publisher}</h2>
        </div>
        <p>Loading apps...</p>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - publisher apps are optional
  }

  if (!apps || apps.length === 0) {
    return null; // Don't show section if no other apps by this publisher
  }

  return (
    <div className="homeBlock">
      <div className="box">
        <h2 className="blockHeader" style={{ display: 'inline-block' }}>More by {publisher}</h2>
        {totalCount > 8 && (
          <Link href={`/apps?q=publisher: ${publisher}`} style={{ fontSize: '16px' }}>
            More
          </Link>
        )}
      </div>
      <ul className={`${styles.all} ${styles.storeList}`}>
        {apps.map((app) => (
          <SingleApp key={app._id} app={app} showSelectCheckbox />
        ))}
      </ul>
    </div>
  );
};

export default MoreByPublisher;
