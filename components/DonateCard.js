import styles from "../styles/donateCard.module.scss";
import { FiPlus } from "react-icons/fi";
import { RiPaypalFill } from "react-icons/ri";

const DonateCard = ({ addMargin = "both" }) => {
    return (
        <div className={`${styles.container} ${addMargin === "both" ? styles.margin : (addMargin === "top" ? styles.marginTop : null)}`}>
            <h2>Switch from TeamViewer to Splashtop and save at least 50%</h2>
            <p>Transparent pricing, no 28-day cancellation trap, high performance and reliability, best in class customer service.</p>
            <div className={styles.buttons}>
                <a className="button spacer accent donate" id="starWine" href="https://www.splashtop.com/products/remote-support?utm_source=winstall.app&utm_medium=banner&utm_campaign=260206_WW_WW_EN_WinstallBanner" rel="sponsored noopener" target="_blank"><FiPlus /> Free trial</a>
            </div>
        </div>
    )
}

export default DonateCard;