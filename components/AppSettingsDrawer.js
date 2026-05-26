import { useState, useEffect } from 'react';
import styles from "../styles/appSettingsDrawer.module.scss";
import exportStyles from "../styles/exportApps.module.scss";
import { CheckboxConfig, RadioConfig, TextInputConfig } from "./AppExport/InputComponents";

const AppSettingsDrawer = ({ app, isOpen, onClose, onConfigChange }) => {
    const [config, setConfig] = useState({
        "--scope": null,
        "-i": false,
        "-h": false,
        "-o": "",
        "--override": false,
        "-l": "",
        "--force": false
    });
    const hiddenOptions = ["--ignore-unavailable"];

    useEffect(() => {
        if (app && app.advancedConfig) {
            setConfig(app.advancedConfig);
        } else {
            setConfig({
                "--scope": null,
                "-i": false,
                "-h": false,
                "-o": "",
                "--override": false,
                "-l": "",
                "--force": false
            });
        }
    }, [app]);

    const updateConfig = (key, val) => {
        const newConfig = { ...config, [key]: val };
        setConfig(newConfig);
        onConfigChange && onConfigChange(app, newConfig);
    };

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}></div>
            <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1L13 13M13 1L1 13" strokeWidth="2.2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <h2>Advanced Options - {app?.name}</h2>
                </div>

                <div className={styles.content}>
                    <div className={exportStyles.expandBlock}>
                        <RadioConfig
                            id="--scope"
                            defaultChecked={config["--scope"]}
                            options={[{ id: "user", label: "User" }, { id: "machine", label: "Machine" }]}
                            updateConfig={updateConfig}
                            hiddenOptions={hiddenOptions}
                            labelText="Installation scope"
                        />

                        <CheckboxConfig id="-i" defaultChecked={config["-i"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Request interactive installation; user input may be needed"/>
                        <CheckboxConfig id="-h" defaultChecked={config["-h"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Request silent installation"/>
                        <CheckboxConfig id="--override" defaultChecked={config["--override"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Override arguments to be passed on to the installer"/>
                        <CheckboxConfig id="--force" defaultChecked={config["--force"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Override the installer hash check"/>

                        <TextInputConfig id="-o" defaultValue={config["-o"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Log location (if supported)" inputPlaceholder="Enter a valid path for your local machine"/>
                        <TextInputConfig id="-l" defaultValue={config["-l"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Location to install to (if supported)" inputPlaceholder="Enter a valid path for your local machine"/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppSettingsDrawer;
