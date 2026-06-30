const getEffectiveConfig = (defaultFilters = {}, appAdvancedConfig) => {
    const effective = { ...defaultFilters };

    if (!appAdvancedConfig) return effective;

    if (appAdvancedConfig.customConfig) {
        effective["--scope"] = appAdvancedConfig["--scope"] ?? "";
        effective["--interactive"] = appAdvancedConfig["--interactive"];
        effective["--silent"] = appAdvancedConfig["--silent"];
        effective["--force"] = appAdvancedConfig["--force"];
    }

    if (appAdvancedConfig["--override"]) {
        effective["--override"] = appAdvancedConfig["--override"];
    }

    if (appAdvancedConfig["--log"]) {
        effective["--log"] = appAdvancedConfig["--log"];
    }

    if (appAdvancedConfig["--location"]) {
        effective["--location"] = appAdvancedConfig["--location"];
    }

    return effective;
};

export default getEffectiveConfig;
