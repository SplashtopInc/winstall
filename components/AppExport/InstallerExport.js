import { useState } from "react";
import { FiDownload, FiInfo } from "react-icons/fi";
import styles from "../../styles/exportApps.module.scss";

const InstallerExport = ({ apps, filters = {} }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const downloadFile = (url, filename = null) => {
        // console.log('Installer download file:', filename);
        const a = document.createElement('a');
        a.href = url;
        if (filename) {
            a.download = filename;
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const pollStatus = async (statusUrl, timeoutMs = 300000) => {
        const startTime = Date.now();
        const pollInterval = 1000;

        while (Date.now() - startTime < timeoutMs) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));

            try {
                const statusResponse = await fetch(statusUrl);

                if (statusResponse.status === 200) {
                    const data = await statusResponse.json();
                    if (data.downloadUrl) {
                        console.log('Installer ready, downloading from S3:', data.downloadUrl);
                        downloadFile(data.downloadUrl); // Filename is set by S3 presigned URL's Content-Disposition header
                        return true;
                    }
                } else if (statusResponse.status === 202) {
                    console.log('Installer still processing...');
                    continue;
                } else if (statusResponse.status === 404) {
                    throw new Error('Task not found or expired');
                } else {
                    const errorData = await statusResponse.json();
                    throw new Error(errorData.error || 'Status check failed');
                }
            } catch (error) {
                throw error;
            }
        }

        throw new Error('timeout');
    };

    const handleInstall = async () => {
        if (!apps || apps.length === 0) {
            alert('No apps selected');
            return;
        }

        if (isProcessing) {
            return;
        }

        setIsProcessing(true);

        try {
            const options = {};

            // Handle silent/interactive (mutually exclusive, default is silent=true)
            if (filters["-i"]) {
                options.silent = false;
            } else if (filters["-h"]) {
                options.silent = true;
            }

            if (filters["--force"]) options.force = true;
            if (filters["--scope"]) options.scope = filters["--scope"];
            if (filters["-o"]) options.log = filters["-o"];
            if (filters["-l"]) options.location = filters["-l"];
            if (filters["--override"]) options.override = filters["--override"];

            const appsPayload = apps.map(app => ({
                name: app.name,
                id: app._id,
                version: app.selectedVersion !== app.latestVersion ? app.selectedVersion : undefined,
                options
            }));

            const configPayload = {
                version: "0.0.1",
                apps: appsPayload
            };

            if (process.env.NODE_ENV === 'development') {
                console.log('Installer config:', JSON.stringify(configPayload, null, 2));
            }

            // [ "Microsoft Edge" ] => "winstall-Microsoft_Edge.exe"
            // [ "Mozialla Firefox (en-US)", "Microsoft Edge" ] => "winstall-Mozilla_Firefox_en_US-etc.exe"
            const appSlug = apps[0].name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
            const filename = `winstall-${appSlug}${apps.length > 1 ? '-etc' : ''}.exe`;

            const response = await fetch('/api/installer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config: configPayload,
                    filename,
                }),
            });

            // Sync mode: direct binary download
            if (response.status === 200) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                console.log('Installer ready, downloading from builder:', filename);
                downloadFile(url, filename);
                window.URL.revokeObjectURL(url);
            }
            // Async mode: poll for status
            else if (response.status === 202) {
                const data = await response.json();
                console.log('Installer generation started, polling status:', data);

                await pollStatus(data.statusUrl);
                console.log('Installer downloaded successfully (async mode)');
            }
            // Error handling
            else {
                const errorData = await response.json();
                console.error('Install failed:', errorData);
                alert(`Install failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Install error:', error);
            if (error.message === 'timeout') {
                alert('Install error: timeout');
            } else {
                alert(`Install error: ${error.message}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.generate}>
            <div className={styles.tipContainer}>
                <FiInfo/>
                <p>Download the instant installer and run!</p>
            </div>

            <div className={`box`}>
                <button
                    className={`button dl accent`}
                    onClick={handleInstall}
                    disabled={isProcessing}
                >
                    <FiDownload />
                    {isProcessing ? 'Processing...' : 'Download installer'}
                </button>
            </div>
        </div>
    );
}

export default InstallerExport;
