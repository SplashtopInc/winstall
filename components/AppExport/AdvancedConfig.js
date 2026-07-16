import { useState, useEffect } from 'react';
import { FiChevronDown, FiInfo } from "react-icons/fi";
import styles from "../../styles/exportApps.module.scss";
import { CheckboxConfig, RadioConfig } from "./InputComponents";
import { DEFAULT_INSTALL_FILTERS } from "../../utils/defaultInstallOptions";

const AdvancedConfig = ({ refreshConfig, activeTab, onFiltersChange }) => {
    const [ expanded, setExpnaded ] = useState(false);
    const [ config, setConfig ] = useState(DEFAULT_INSTALL_FILTERS);

    const updateConfig = async (key, val) => {
        const newConfig = { ...config, [key]: val};

        if (key === "--interactive") {
            newConfig["--silent"] = !val;
        }

        setConfig(newConfig);
        refreshConfig(newConfig);
        onFiltersChange && onFiltersChange(newConfig);

        await localStorage.setItem("winstall-default-options", JSON.stringify(newConfig));
    }

    useEffect(() => {
        const loadExistingConfig = async () => {
            let previousConfig = await localStorage.getItem("winstall-default-options");

            if (previousConfig) {
                previousConfig = { ...DEFAULT_INSTALL_FILTERS, ...JSON.parse(previousConfig) };
                setExpnaded(true);
            } else {
                previousConfig = { ...DEFAULT_INSTALL_FILTERS };
            }

            refreshConfig(previousConfig);
            onFiltersChange && onFiltersChange(previousConfig);
            setConfig(previousConfig);
        }

        loadExistingConfig();

    }, [ activeTab ]);

    if (activeTab === ".json") {
        return null;
    }

    return (
        <div className={styles.expandBlock}>
            <h3 className={`${styles.expandHeader} ${ expanded ? styles.expandedHeader : ''}`} onClick={() => setExpnaded(e => !e)}>
                <FiChevronDown size={22} className={expanded ? styles.expandedIcon : ''}/>
                Default Options
            </h3>

            { expanded && (
                <div>
                    <p className={styles.center}><FiInfo/> All of the following options are persisted locally in your browser.</p>

                    <RadioConfig
                        id="--scope"
                        groupId="default-options-scope"
                        defaultChecked={config["--scope"]}
                        options={[{ id: "", label: "Default" }, { id: "user", label: "User" }, { id: "machine", label: "Machine" }]}
                        updateConfig={updateConfig}
                        hiddenOptions={[]}
                        labelText="Installation scope"
                    />

                    <CheckboxConfig id="--interactive" inputId="default-options-interactive" defaultChecked={config["--interactive"]} updateConfig={updateConfig} hiddenOptions={[]} labelText="Request interactive installation; user input may be needed"/>
                    <CheckboxConfig id="--force" inputId="default-options-force" defaultChecked={config["--force"]} updateConfig={updateConfig} hiddenOptions={[]} labelText="Override the installer hash check"/>
                </div>
            )}
        </div>
    )
}

export default AdvancedConfig;
