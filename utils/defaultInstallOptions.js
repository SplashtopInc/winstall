import {
  drawerConfigToInstallOptions,
  hasInstallOptions,
  installOptionsToDrawerConfig,
} from "./installOptions";

export const DEFAULT_INSTALL_FILTERS = {
  "--scope": "",
  "--interactive": false,
  "--silent": true,
  "--force": false,
};

/** Convert stored (dash-free) install options into UI default filters. */
export function toDefaultInstallFilters(installOptions) {
  if (!hasInstallOptions(installOptions)) {
    return { ...DEFAULT_INSTALL_FILTERS };
  }

  const drawer = installOptionsToDrawerConfig(installOptions);

  return {
    "--scope": drawer["--scope"] ?? "",
    "--interactive": drawer["--interactive"] ?? false,
    "--silent": drawer["--silent"] ?? true,
    "--force": drawer["--force"] ?? false,
  };
}

/** Convert UI default filters into stored (dash-free) install options. */
export function fromDefaultInstallFilters(filters) {
  return drawerConfigToInstallOptions({
    ...DEFAULT_INSTALL_FILTERS,
    ...(filters || {}),
  });
}
