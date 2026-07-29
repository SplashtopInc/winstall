import { useState, useEffect } from "react";
import styles from "../styles/apps.module.scss";
import SingleApp from "./SingleApp";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";

const RelatedApps = ({ appId }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedApps = async () => {
      try {
        setLoading(true);
        const { response, error: fetchError } = await fetchWinstallAPI(
          `/apps/related/${appId}?limit=8`
        );

        if (fetchError) {
          setError(fetchError);
          return;
        }

        // Normalize response structure (similar to /apps/search)
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

        // Transform icons to full URLs
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
      <div className="homeBlock">
        <h2 className="blockHeader">Related Apps</h2>
        <p>Loading related apps...</p>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - related apps are optional
  }

  if (!apps || apps.length === 0) {
    return null; // Don't show section if no related apps
  }

  return (
    <div className="homeBlock">
      <h2 className="blockHeader">Related Apps</h2>
      <ul className={`${styles.all} ${styles.storeList}`}>
        {apps.map((app) => (
          <SingleApp key={app._id} app={app} showSelectCheckbox />
        ))}
      </ul>
    </div>
  );
};

export default RelatedApps;
