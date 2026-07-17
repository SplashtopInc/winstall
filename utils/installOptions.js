const ALLOWED_SCOPES = new Set(["", "user", "machine"]);

export const INSTALL_OPTION_KEYS = [
  "scope",
  "interactive",
  "silent",
  "force",
  "override",
  "log",
  "location",
];

export function normalizeInstallOptions(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const normalized = {};

  if (raw._hasCustomConfig === true) {
    normalized._hasCustomConfig = true;
  }
  if ("scope" in raw && typeof raw.scope === "string" && ALLOWED_SCOPES.has(raw.scope)) {
    normalized.scope = raw.scope;
  }

  if (raw.interactive === true) {
    normalized.interactive = true;
  }

  if (raw.silent === true) {
    normalized.silent = true;
  }

  if (raw.force === true) {
    normalized.force = true;
  }

  if (typeof raw.override === "string" && raw.override.trim()) {
    normalized.override = raw.override.trim();
  }

  if (typeof raw.log === "string" && raw.log.trim()) {
    normalized.log = raw.log.trim();
  }

  if (typeof raw.location === "string" && raw.location.trim()) {
    normalized.location = raw.location.trim();
  }

  return normalized;
}

export function hasInstallOptions(raw) {
  return Object.keys(normalizeInstallOptions(raw)).length > 0;
}

export function installOptionsToWingetFlags(options) {
  const normalized = normalizeInstallOptions(options);
  const flags = {};

  if (normalized.scope) {
    flags["--scope"] = normalized.scope;
  }

  if (normalized.interactive) {
    flags["--interactive"] = true;
  } else if (normalized.silent) {
    flags["--silent"] = true;
  }

  if (normalized.force) {
    flags["--force"] = true;
  }

  if (normalized.override) {
    flags["--override"] = normalized.override;
  }

  if (normalized.log) {
    flags["--log"] = normalized.log;
  }

  if (normalized.location) {
    flags["--location"] = normalized.location;
  }

  return flags;
}

const DEFAULT_DRAWER_CONFIG = {
  "--scope": "",
  "--interactive": false,
  "--silent": true,
  "--override": "",
  "--log": "",
  "--location": "",
  "--force": false,
};

export function hasCustomScopeInstallOptions(installOptions) {
  if (!installOptions || typeof installOptions !== "object") {
    return false;
  }

  const normalized = normalizeInstallOptions(installOptions);

  return (
    normalized._hasCustomConfig ||
    "scope" in normalized ||
    normalized.interactive === true ||
    normalized.force === true
  );
}

export function installOptionsToDrawerConfig(options) {
  const normalized = normalizeInstallOptions(options);

  if (!hasInstallOptions(normalized)) {
    return { ...DEFAULT_DRAWER_CONFIG };
  }

  return {
    "--scope": normalized.scope || "",
    "--interactive": normalized.interactive === true,
    "--silent": normalized.interactive ? false : normalized.silent !== false,
    "--override": normalized.override || "",
    "--log": normalized.log || "",
    "--location": normalized.location || "",
    "--force": normalized.force === true,
  };
}

export function hasScopedInstallOptions(installOptions) {
  const normalized = normalizeInstallOptions(installOptions);
  return Boolean(
    normalized._hasCustomConfig ||
    "scope" in normalized ||
    normalized.interactive ||
    normalized.force
  );
}

export function installOptionsToDrawerState(installOptions) {
  return {
    ...installOptionsToDrawerConfig(installOptions),
    customConfig: hasScopedInstallOptions(installOptions),
  };
}

export function drawerStateToInstallOptions(config) {
  if (!config || typeof config !== "object") {
    return {};
  }

  if (!config.customConfig) {
    return normalizeInstallOptions({
      override: config["--override"] || "",
      log: config["--log"] || "",
      location: config["--location"] || "",
    });
  }

  const options = drawerConfigToInstallOptions(config);
  return {
    ...options,
    _hasCustomConfig: true,
  };
}

export function installOptionsToAppDrawerConfig(installOptions) {
  return {
    ...installOptionsToDrawerConfig(installOptions),
    customConfig: hasCustomScopeInstallOptions(installOptions),
  };
}

export function drawerConfigToInstallOptions(config, { useCustomScope = true } = {}) {
  if (!config || typeof config !== "object") {
    return {};
  }

  const candidate = {
    scope: config["--scope"] || "",
    interactive: config["--interactive"] === true,
    silent: config["--interactive"] ? false : config["--silent"] === true,
    force: config["--force"] === true,
    override: config["--override"] || "",
    log: config["--log"] || "",
    location: config["--location"] || "",
  };

  if (!useCustomScope) {
    delete candidate.scope;
    delete candidate.interactive;
    delete candidate.silent;
    delete candidate.force;
  }

  return normalizeInstallOptions(candidate);
}
