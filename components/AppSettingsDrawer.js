import { useState, useEffect } from 'react';
import styles from "../styles/appSettingsDrawer.module.scss";
import exportStyles from "../styles/exportApps.module.scss";
import { CheckboxConfig, RadioConfig, TextInputConfig } from "./AppExport/InputComponents";
import {
    drawerStateToInstallOptions,
    installOptionsToDrawerState,
} from "../utils/installOptions";

const DEFAULT_APP_CONFIG = {
    customConfig: false,
    "--scope": "",
    "--interactive": false,
    "--silent": true,
    "--override": "",
    "--log": "",
    "--location": "",
    "--force": false
};

const SCOPED_CONFIG_KEYS = new Set(["--scope", "--interactive", "--force"]);

const AppSettingsDrawer = ({
    app,
    isOpen,
    onClose,
    onConfigChange,
    defaultFilters = {},
}) => {
    const [config, setConfig] = useState(DEFAULT_APP_CONFIG);
    const hiddenOptions = ["--ignore-unavailable"];

    useEffect(() => {
        if (!isOpen) {
            setConfig({ ...DEFAULT_APP_CONFIG });
            return;
        }

        if (!app) {
            return;
        }

        const drawerState = installOptionsToDrawerState(app.installOptions);
        const finalConfig = {
            ...DEFAULT_APP_CONFIG,
            ...drawerState,
        };

        // console.group(`🎨 AppSettingsDrawer Debug - ${app.name}`);
        // console.log('1️⃣ Global Settings (defaultFilters):', defaultFilters);
        // console.log('2️⃣ App InstallOptions (raw):', app.installOptions);
        // console.log('3️⃣ Drawer State (converted):', drawerState);
        // console.log('4️⃣ Final Config (merged):', finalConfig);
        // console.groupEnd();

        setConfig(finalConfig);
    }, [isOpen, app?._id, defaultFilters]);

    const updateConfig = (key, val) => {
        const newConfig = { ...config, [key]: val };

        if (key === "--interactive") {
            newConfig["--silent"] = !val;
        }

        if (key === "customConfig" && val === true) {
            newConfig["--scope"] = defaultFilters["--scope"] ?? "";
            newConfig["--interactive"] = defaultFilters["--interactive"] ?? false;
            newConfig["--silent"] = newConfig["--interactive"]
                ? false
                : defaultFilters["--silent"] !== false;
            newConfig["--force"] = defaultFilters["--force"] ?? false;
        }

        if (SCOPED_CONFIG_KEYS.has(key)) {
            newConfig.customConfig = true;
        }

        setConfig(newConfig);
        onConfigChange && onConfigChange(app, drawerStateToInstallOptions(newConfig));
    };

    const optionsDisabled = !config.customConfig;

    const scopeValue = config.customConfig
        ? config["--scope"]
        : (defaultFilters["--scope"] ?? "");

    const interactiveValue = config.customConfig
        ? config["--interactive"]
        : (defaultFilters["--interactive"] ?? false);

    const forceValue = config.customConfig
        ? config["--force"]
        : (defaultFilters["--force"] ?? false);

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
                        <CheckboxConfig
                            id="customConfig"
                            inputId="app-settings-customConfig"
                            defaultChecked={config.customConfig}
                            updateConfig={updateConfig}
                            hiddenOptions={[]}
                            labelText="Use custom configuration"
                            hideParameterName={true}
                        />

                        <RadioConfig
                            id="--scope"
                            groupId="app-settings-scope"
                            defaultChecked={scopeValue}
                            options={[{ id: "", label: "Default" }, { id: "user", label: "User" }, { id: "machine", label: "Machine" }]}
                            updateConfig={updateConfig}
                            hiddenOptions={hiddenOptions}
                            labelText="Installation scope"
                            disabled={optionsDisabled}
                        />

                        <CheckboxConfig id="--interactive" inputId="app-settings-interactive" defaultChecked={interactiveValue} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Request interactive installation; user input may be needed" disabled={optionsDisabled}/>
                        <CheckboxConfig id="--force" inputId="app-settings-force" defaultChecked={forceValue} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Override the installer hash check" disabled={optionsDisabled}/>

                        <TextInputConfig id="--override" defaultValue={config["--override"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Override arguments to be passed on to the installer" inputPlaceholder="Enter arguments for installer"/>
                        <TextInputConfig id="--log" defaultValue={config["--log"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Log location (if supported)" inputPlaceholder="Enter a valid file path for your local machine"/>
                        <TextInputConfig id="--location" defaultValue={config["--location"]} updateConfig={updateConfig} hiddenOptions={hiddenOptions} labelText="Location to install to (if supported)" inputPlaceholder="Enter a valid folder path for your local machine"/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppSettingsDrawer;
