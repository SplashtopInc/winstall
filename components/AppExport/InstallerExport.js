import { useState, useRef } from "react";
import { FiDownload, FiInfo } from "react-icons/fi";
import styles from "../../styles/exportApps.module.scss";
import {
    buildInstallerConfig,
    downloadInstantInstaller,
} from "../../utils/downloadInstantInstaller";

const InstallerExport = ({ apps, filters = {}, onExportDownload }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const countdownTimerRef = useRef(null);

    const handleInstall = async () => {
        if (!apps || apps.length === 0) {
            alert('No apps selected');
            return;
        }

        if (isProcessing) {
            return;
        }

        setIsProcessing(true);
        setCountdown(10);

        countdownTimerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev > 0) {
                    return prev - 1;
                }
                return 0;
            });
        }, 1000);

        try {
            await downloadInstantInstaller(apps, filters);

            if (typeof onExportDownload === "function") onExportDownload();
        } catch (error) {
            console.error('Install error:', error);
            if (error.message === 'timeout') {
                alert('Download timeout');
            } else if (error.message === 'No apps selected') {
                alert('No apps selected');
            } else {
                alert(`Install error: ${error.message}`);
            }
        } finally {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            setIsProcessing(false);
            setCountdown(10);
        }
    };

    const configPayload = buildInstallerConfig(apps, filters);

    return (
        <div className={styles.generate}>
            {process.env.NODE_ENV === 'development' && (
                <textarea
                    readOnly
                    value={JSON.stringify(configPayload, null, 2)}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                    spellCheck={false}
                    data-gramm_editor={false}
                    rows={16}
                />
            )}
            <div className={styles.tipContainer}>
                <FiInfo/>
                <p>Download the instant installer and run!</p>
            </div>

            <div className={styles.exportActions}>
                <button
                    type="button"
                    className="button dl accent"
                    onClick={handleInstall}
                    disabled={isProcessing}
                >
                    <FiDownload />
                    {isProcessing ? `Processing (${countdown})...` : 'Download installer'}
                </button>
            </div>
        </div>
    );
}

export default InstallerExport;
