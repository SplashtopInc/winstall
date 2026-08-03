import styles from "../styles/donateCard.module.scss";
import { FiPlus } from "react-icons/fi";
import useRandomAd from "../hooks/useRandomAd";

const DonateCard = ({ addMargin = "both", placement = "home" }) => {
  const ad = useRandomAd(placement);

  if (!ad) return null;

  const marginClass =
    addMargin === "both"
      ? styles.margin
      : addMargin === "top"
        ? styles.marginTop
        : null;

  return (
    <div className={`${styles.container} ${marginClass || ""}`.trim()}>
      <h2>{ad.headline}</h2>
      <p>{ad.body}</p>
      <div className={styles.buttons}>
        <a
          className="button spacer accent donate"
          id="starWine"
          href={ad.href}
          rel="sponsored noopener"
          target="_blank"
        >
          <FiPlus /> {ad.cta}
        </a>
      </div>
    </div>
  );
};

export default DonateCard;
