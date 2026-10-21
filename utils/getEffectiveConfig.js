import {
  hasCustomScopeInstallOptions,
  normalizeInstallOptions,
} from "./installOptions.js";

const getEffectiveConfig = (defaultFilters = {}, installOptions) => {
  const effective = { ...defaultFilters };

  if (!installOptions) return effective;

  const normalized = normalizeInstallOptions(installOptions);

  if (hasCustomScopeInstallOptions(installOptions)) {
    effective["--scope"] = normalized.scope ?? "";
    effective["--interactive"] = normalized.interactive === true;
    effective["--silent"] = normalized.interactive
      ? false
      : normalized.silent !== false;
    effective["--force"] = normalized.force === true;
  }

  if (normalized.override) {
    effective["--override"] = normalized.override;
  }

  if (normalized.log) {
    effective["--log"] = normalized.log;
  }

  if (normalized.location) {
    effective["--location"] = normalized.location;
  }

  return effective;
};

export default getEffectiveConfig;
