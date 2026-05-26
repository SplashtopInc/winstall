import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "../../styles/exportApps.module.scss";
import generateWingetImport from "../../utils/generateWingetImport";
import GenericExport from "./GenericExport";
import InstallerExport from "./InstallerExport";
import AdvancedConfig from "./AdvancedConfig";

const ExportApps = ({ apps, title, subtitle }) => {
  const [ batScript, setBatScript ] = useState("");
  const [ psScript, setPsScript ] = useState("");
  const [ wingetScript, setWingetScript ] = useState("");
  const [ filters, setFilters ] = useState({});
  const [ wingetImportCommand, setWingetImportCommand ] = useState("");
  const [active, setActive] = useState(".installer");

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
    if(!apps) return;

    let installs = [];

    let advancedFilters = "";

    if(filters){
        advancedFilters = Object.entries({ ...filters} ).filter(i => i[1] === true).map(i => i[0]).join(" ");

        if(filters["-o"]) advancedFilters += ` -o "${filters["-o"]}"`;
        if(filters["-l"]) advancedFilters += ` -l "${filters["-l"]}"`;
        if(filters["--scope"]) advancedFilters += ` --scope "${filters["--scope"]}"`;
    }

    apps.map((app) => {
      let appFilters = advancedFilters;

      if (app.advancedConfig) {
        const appConfig = app.advancedConfig;
        let appAdvancedFilters = "";

        appAdvancedFilters = Object.entries({ ...appConfig }).filter(i => i[1] === true).map(i => i[0]).join(" ");

        if(appConfig["-o"]) appAdvancedFilters += ` -o "${appConfig["-o"]}"`;
        if(appConfig["-l"]) appAdvancedFilters += ` -l "${appConfig["-l"]}"`;
        if(appConfig["--scope"]) appAdvancedFilters += ` --scope "${appConfig["--scope"]}"`;

        appFilters = appAdvancedFilters;
      }

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

    setWingetImportCommand(`winget import --import-file "$fileName" ${advancedFilters}`);

    }, [apps, filters]);

  useEffect(() => {
    const restoreDefaultTab = async () => {
        const defaultExportTab = await localStorage.getItem("winstall-default-export-tab");

        if(defaultExportTab !== null){
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

  const refreshFilters = async ( newConfig, unavailableOptions ) => {
        let availableConfig = { ...newConfig }

        await unavailableOptions.map(opt => {
            delete availableConfig[opt]
        });

        setFilters(availableConfig);
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
                return <li key={index} className={ tab.key === active ? styles.active : ''} onClick={() => changeTab(tab.key)}>{tab.title}</li>
            }) }
        </ul>

        {/* <AdvancedConfig refreshConfig={refreshFilters} activeTab={active}/> */}

        { tabs.map((tab, index) => {
            return <section key={index} className={ tab.key === active ? styles.displaySection : styles.hideSection }>{ tab.element }</section>
        }) }

    </div>
  )
}

export default ExportApps;