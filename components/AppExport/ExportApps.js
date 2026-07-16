import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "../../styles/exportApps.module.scss";
import generateWingetImport from "../../utils/generateWingetImport";
import getEffectiveConfig from "../../utils/getEffectiveConfig";
import { DEFAULT_INSTALL_FILTERS } from "../../utils/defaultInstallOptions";
import GenericExport from "./GenericExport";
import InstallerExport from "./InstallerExport";
import AdvancedConfig from "./AdvancedConfig";

const ExportApps = ({
    apps,
    title,
    subtitle,
    initialFilters,
    onDefaultFiltersChange,
    persistHint,
}) => {
    const [ batScript, setBatScript ] = useState("");
    const [ psScript, setPsScript ] = useState("");
    const [ wingetScript, setWingetScript ] = useState("");
    const [ filters, setFilters ] = useState(() => ({
        ...DEFAULT_INSTALL_FILTERS,
        ...(initialFilters || {}),
    }));
    const [ wingetImportCommand, setWingetImportCommand ] = useState("");
    const [ active, setActive ] = useState(".installer");

    const resolvedInitialFilters = useMemo(
        () => ({
            ...DEFAULT_INSTALL_FILTERS,
            ...(initialFilters || {}),
        }),
        [initialFilters]
    );

    const tabs = useMemo(() => {
        return [
            {
                title: "Download Installer",
                key: ".installer",
                element: <InstallerExport apps={apps} filters={filters} />
            },
            {
                title: "Batch",
                key: ".bat",
                element: <GenericExport fileContent={batScript} fileExtension=".bat"/>
            },
            {
                title: "PowerShell",
                key: ".ps1",
                element: <GenericExport fileContent={psScript} fileExtension=".ps1"/>
            },
            {
                title: "Winget Import",
                key: ".json",
                element: <GenericExport
                            fileContent={wingetScript}
                            displayedCommand={wingetImportCommand}
                            fileExtension=".json"
                            prioritiseDownload={true}
                            tip="To install your apps, press the button below. Then, open a terminal window in the same folder as the downloaded .json file, paste the command into the terminal window and hit enter."
                        />
            }
        ]
    }, [ batScript, psScript, wingetScript, wingetImportCommand, apps, filters ])

    const handleScriptChange = useCallback(async () => {
        if (!apps) return;

        const buildFilterString = (f) => {
            if (!f) return "";
            let parts = [];

            // Silent/Interactive (Mutually Exclusive, Default Silent)
            if (f["--interactive"]) {
                parts.push("--interactive");
            } else {
                parts.push("--silent");
            }

            // Boolean flags
            if (f["--force"]) parts.push("--force");
            if (f["--ignore-unavailable"]) parts.push("--ignore-unavailable");

            // Value flags
            if (f["--log"]) parts.push(`--log "${f["--log"]}"`);
            if (f["--location"]) parts.push(`--location "${f["--location"]}"`);
            if (f["--scope"]) parts.push(`--scope "${f["--scope"]}"`);
            if (f["--override"] && f["--override"].trim()) parts.push(`--override "${f["--override"]}"`);

            return parts.join(" ");
        }

        let installs = [];

        apps.map((app) => {
            const appFilters = buildFilterString(getEffectiveConfig(filters, app.installOptions));

            installs.push(
                `winget install --id=${app._id}${app.selectedVersion !== app.latestVersion ? ` -v "${app.selectedVersion}"` : ""} -e ${appFilters}`
            );
            return app;
        });

        let newBatchScript = installs.join(" && ");
        let newPSScript = installs.join(" ; ");

        setBatScript(newBatchScript);
        setPsScript(newPSScript);
        setWingetScript(JSON.stringify(await generateWingetImport(apps), 2));
        setWingetImportCommand(`winget import --import-file "$fileName"`);
    }, [apps, filters]);

useEffect(() => {
    const restoreDefaultTab = async () => {
        const defaultExportTab = await localStorage.getItem("winstall-default-export-tab");

        if (defaultExportTab !== null) {
            setActive(defaultExportTab);
        }
    }

    restoreDefaultTab();
    handleScriptChange();
}, [handleScriptChange]);

const changeTab = async ( tabKey ) => {
    setActive(tabKey);
    await localStorage.setItem("winstall-default-export-tab", tabKey);
}

const refreshFilters = ( newConfig ) => {
    setFilters(newConfig);
}

return (
    <div className={styles.getScript} id="packScript">

        { title && (
            <div className={styles.scriptHeader}>
                <h3>{title}</h3>
            </div>
        )}

        { subtitle && <p>{subtitle}</p> }

        <ul className={styles.tabHeader}>
            { tabs.map((tab, index) => {
                return <li key={index} className={ tab.key === active ? styles.active : ''} onClick={() => changeTab(tab.key)}>{tab.title}</li>;
            }) }
        </ul>

        <AdvancedConfig
            refreshConfig={refreshFilters}
            activeTab={active}
            onFiltersChange={onDefaultFiltersChange}
            initialFilters={resolvedInitialFilters}
            persistHint={persistHint}
        />

        { tabs.map((tab, index) => {
            return <section key={index} className={ tab.key === active ? styles.displaySection : styles.hideSection }>{ tab.element }</section>
        }) }

    </div>
    )
}

export default ExportApps;
