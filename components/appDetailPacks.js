import { useEffect, useState } from "react";

import AppDetailPackCard from "./appDetailPackCard";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import {
  appDetailPacksPath,
  readAppDetailPacks,
} from "../utils/appDetailPacks";
import styles from "../styles/appDetailPacks.module.scss";

export default function AppDetailPacks({ appId }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!appId) {
      setLoading(false);
      setFailed(false);
      setPacks([]);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    fetchWinstallAPI(appDetailPacksPath(appId)).then(({ response, error }) => {
      if (cancelled) return;
      if (error) {
        setPacks([]);
        setFailed(true);
      } else {
        setPacks(readAppDetailPacks(response));
        setFailed(false);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [appId]);

  if (!appId || failed || (!loading && packs.length === 0)) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Packs with this app">
      <h2 className={styles.title}>Packs with this app</h2>
      {!loading && (
        <ul className={styles.grid}>
          {packs.map((pack) =>
            pack?._id ? (
              <li key={pack._id}>
                <AppDetailPackCard pack={pack} />
              </li>
            ) : null
          )}
        </ul>
      )}
    </section>
  );
}
