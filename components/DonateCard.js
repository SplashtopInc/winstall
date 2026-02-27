import styles from "../styles/donateCard.module.scss";
import { FiPlus } from "react-icons/fi";
import { RiPaypalFill } from "react-icons/ri";

const DonateCard = ({ addMargin = "both" }) => {
    return (
        <div className={`${styles.container} ${addMargin === "both" ? styles.margin : (addMargin === "top" ? styles.marginTop : null)}`}>
            <h2>Deploy Once, Update Forever with Splashtop</h2>
            <p>Splashtop AEM automates your entire application lifecycle —from vendor and custom packaging to seamless continuous updates —saving time and reduce vulnerability risks.</p>
            <div className={styles.buttons}>
                <a className="button spacer accent donate" id="starWine" href="https://www.splashtop.com/products/autonomous-endpoint-management?utm_source=winstall.app&utm_medium=banner&utm_campaign=260206_WW_WW_EN_WinstallBanner" rel="sponsored noopener" target="_blank"><FiPlus /> Free trial</a>
            </div>
        </div>
    )
}

export default DonateCard;