import styles from "../styles/donateCard.module.scss";
import { FiPlus } from "react-icons/fi";
import useRandomAd from "../hooks/useRandomAd";

const SHELF_PLACEMENTS = new Set(["apps-list", "pack-list"]);

const DonateCard = ({ addMargin = "both", placement = "home" }) => {
  const ad = useRandomAd(placement);

  if (!ad) return null;

  const marginClass =
    addMargin === "both"
      ? styles.margin
      : addMargin === "top"
        ? styles.marginTop
        : null;
  const shelfClass = SHELF_PLACEMENTS.has(placement) ? styles.shelf : null;

  return (
    <div
      className={`${styles.container} ${shelfClass || ""} ${marginClass || ""}`.trim()}
    >
      <h2>{ad.headline}</h2>
      <p>{ad.body}</p>
      <div className={styles.buttons}>
        <a
          className={styles.cta}
          href={ad.href}
          rel="sponsored noopener"
          target="_blank"
        >
          <FiPlus aria-hidden="true" />
          {ad.cta}
        </a>
      </div>
    </div>
  );
};

export default DonateCard;
