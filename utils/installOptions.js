const ALLOWED_SCOPES = new Set(["", "user", "machine"]);
const OVERRIDE_MAX_LENGTH = 512;
const PATH_MAX_LENGTH = 260;
// Quote breakout, command separators, redirection, cmd escape, env expansion,
// PowerShell subexpression/escape, and control characters. Parentheses stay.
const SHELL_META = /["&|<>^%;`$]|[\u0000-\u001F\u007F]/;

export const INSTALL_OPTION_KEYS = [
  "scope",
  "interactive",
  "silent",
  "force",
  "override",
  "log",
  "location",
];

function trimmedText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isPathSegment(segment) {
  return segment.length > 0 && !/[<>:"|?*]/.test(segment);
}

function isPathRemainder(remainder) {
  if (remainder === "") return true;

  const segments = remainder.split(/[\\/]/);
  return segments.every((segment, index) => {
    if (segment === "" && index === segments.length - 1) return true;
    return isPathSegment(segment);
  });
}

function isWindowsAbsolutePath(value) {
  const drive = /^[A-Za-z]:[\\/](.*)$/.exec(value);
  if (drive) return isPathRemainder(drive[1]);

  const unc = /^(?:\\\\|\/\/)([^\\/]+)[\\/]([^\\/].*)$/.exec(value);
  if (!unc) return false;
  return isPathSegment(unc[1]) && isPathRemainder(unc[2]);
}

export function isSafeOverride(value) {
  const text = trimmedText(value);
  if (!text || text.length > OVERRIDE_MAX_LENGTH) return false;
  return !SHELL_META.test(text);
}

export function isSafeInstallPath(value) {
  const text = trimmedText(value);
  if (!text || text.length > PATH_MAX_LENGTH) return false;
  if (SHELL_META.test(text)) return false;
  return isWindowsAbsolutePath(text);
}

export function quoteWingetValue(flag, value, { path = false } = {}) {
  const text = trimmedText(value);
  const safe = path ? isSafeInstallPath(text) : isSafeOverride(text);
  if (!safe) return "";
  return `${flag} "${text}"`;
}

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

  if (isSafeOverride(raw.override)) {
    normalized.override = raw.override.trim();
  }

  if (isSafeInstallPath(raw.log)) {
    normalized.log = raw.log.trim();
  }

  if (isSafeInstallPath(raw.location)) {
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
