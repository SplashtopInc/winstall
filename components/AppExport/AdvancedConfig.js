import { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiInfo } from "react-icons/fi";
import styles from "../../styles/exportApps.module.scss";
import { CheckboxConfig, RadioConfig } from "./InputComponents";
import { DEFAULT_INSTALL_FILTERS } from "../../utils/defaultInstallOptions";

function resolveFilters(filters) {
    return {
        ...DEFAULT_INSTALL_FILTERS,
        ...(filters || {}),
    };
}

function isCustomFilters(filters) {
    return (
        filters["--scope"] !== DEFAULT_INSTALL_FILTERS["--scope"] ||
        filters["--interactive"] !== DEFAULT_INSTALL_FILTERS["--interactive"] ||
        filters["--force"] !== DEFAULT_INSTALL_FILTERS["--force"]
    );
}

function filtersKey(filters) {
    const resolved = resolveFilters(filters);
    return [
        resolved["--scope"] || "",
        resolved["--interactive"] ? "1" : "0",
        resolved["--silent"] ? "1" : "0",
        resolved["--force"] ? "1" : "0",
    ].join("|");
}

const AdvancedConfig = ({
    refreshConfig,
    activeTab,
    onFiltersChange,
    initialFilters,
    persistHint = "These options apply to your current selection and clear when you unselect all apps.",
}) => {
    const [expanded, setExpnaded] = useState(() =>
        isCustomFilters(resolveFilters(initialFilters))
    );
    const [config, setConfig] = useState(() => resolveFilters(initialFilters));
    const lastSyncedKey = useRef(filtersKey(initialFilters));

    const updateConfig = (key, val) => {
        const newConfig = { ...config, [key]: val };

        if (key === "--interactive") {
            newConfig["--silent"] = !val;
        }

        setConfig(newConfig);
        lastSyncedKey.current = filtersKey(newConfig);
        refreshConfig(newConfig);
        onFiltersChange && onFiltersChange(newConfig);
    }

    useEffect(() => {
        const nextKey = filtersKey(initialFilters);
        if (nextKey === lastSyncedKey.current && activeTab !== ".json") {
            return;
        }

        const nextConfig = resolveFilters(initialFilters);
        lastSyncedKey.current = nextKey;
        setConfig(nextConfig);
        refreshConfig(nextConfig);

        if (isCustomFilters(nextConfig)) {
            setExpnaded(true);
        }
        // Intentionally sync from parent props / tab changes only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, initialFilters]);

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
                    <p className={styles.center}><FiInfo/> {persistHint}</p>

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
