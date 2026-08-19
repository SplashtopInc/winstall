import getEffectiveConfig from "./getEffectiveConfig";

export function buildInstallerOptions(sourceFilters = {}) {
  const options = {
    silent: true,
  };

  if (sourceFilters["--interactive"]) {
    delete options.silent;
    options.interactive = true;
  } else if (sourceFilters["--silent"]) {
    options.silent = true;
    delete options.interactive;
  }

  if (sourceFilters["--force"]) options.force = true;
  if (sourceFilters["--scope"]) options.scope = sourceFilters["--scope"];
  if (sourceFilters["--log"]) options.log = sourceFilters["--log"];
  if (sourceFilters["--location"]) options.location = sourceFilters["--location"];
  if (sourceFilters["--override"]) options.override = sourceFilters["--override"];

  return options;
}

export function buildInstallerConfig(apps, filters = {}) {
  return {
    version: "0.0.1",
    apps: (apps || []).map((app) => ({
      name: app.name,
      id: app._id,
      version:
        app.selectedVersion !== app.latestVersion
          ? app.selectedVersion
          : undefined,
      options: buildInstallerOptions(
        getEffectiveConfig(filters, app.installOptions)
      ),
    })),
  };
}

function downloadFile(url, filename = null) {
  const a = document.createElement("a");
  a.href = url;
  if (filename) {
    a.download = filename;
  }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function pollStatus(statusUrl, timeoutMs = 60000) {
  const startTime = Date.now();
  const pollInterval = 1000;

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(statusUrl);

    if (statusResponse.status === 200) {
      const data = await statusResponse.json();
      if (data.downloadUrl) {
        downloadFile(data.downloadUrl);
        return;
      }
    } else if (statusResponse.status === 202) {
      continue;
    } else if (statusResponse.status === 404) {
      throw new Error("Task not found or expired");
    } else {
      const errorData = await statusResponse.json();
      throw new Error(errorData.error || "Status check failed");
    }
  }

  throw new Error("timeout");
}

export function installerFilename(apps) {
  const appSlug = (apps[0]?.name || "apps")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `winstall-${appSlug}${apps.length > 1 ? "-etc" : ""}.exe`;
}

export async function downloadInstantInstaller(apps, filters = {}) {
  if (!apps || apps.length === 0) {
    throw new Error("No apps selected");
  }

  const config = buildInstallerConfig(apps, filters);
  const filename = installerFilename(apps);

  if (process.env.NODE_ENV === "development") {
    console.log("Installer config:", JSON.stringify(config, null, 2));
  }

  const response = await fetch("/api/installer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      config,
      filename,
    }),
  });

  if (response.status === 200) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    downloadFile(url, filename);
    window.URL.revokeObjectURL(url);
    return;
  }

  if (response.status === 202) {
    const data = await response.json();
    await pollStatus(data.statusUrl);
    return;
  }

  const errorData = await response.json();
  throw new Error(errorData.error || "Unknown error");
}
