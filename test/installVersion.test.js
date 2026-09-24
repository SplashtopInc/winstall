const test = require("node:test");
const assert = require("node:assert/strict");

test("getCatalogLatestVersion uses versions[0] without sorting", async () => {
  const { getCatalogLatestVersion } = await import("../utils/installVersion.js");

  assert.equal(
    getCatalogLatestVersion({
      versions: [{ version: "2.0.0" }, { version: "1.2.0" }, { version: "1.5.0" }],
    }),
    "2.0.0"
  );

  assert.equal(
    getCatalogLatestVersion({
      versions: [{ version: "1.2.0" }, { version: "2.0.0" }],
    }),
    "1.2.0"
  );

  assert.equal(
    getCatalogLatestVersion({ latestVersion: "9.0.0" }),
    "9.0.0"
  );
});

test("resolvePackAppVersion treats missing and blank as unpinned", async () => {
  const { resolvePackAppVersion } = await import("../utils/installVersion.js");
  const versions = [{ version: "2.0.0" }, { version: "1.0.0" }];

  assert.deepEqual(resolvePackAppVersion({ versions }), {
    displayVersion: "2.0.0",
    pinnedVersion: "",
  });

  assert.deepEqual(resolvePackAppVersion({ appVersion: "", versions }), {
    displayVersion: "2.0.0",
    pinnedVersion: "",
  });

  assert.deepEqual(resolvePackAppVersion({ appVersion: "  ", versions }), {
    displayVersion: "2.0.0",
    pinnedVersion: "",
  });

  assert.deepEqual(resolvePackAppVersion({ appVersion: null, versions }), {
    displayVersion: "2.0.0",
    pinnedVersion: "",
  });
});

test("resolvePackAppVersion pins valid appVersion including tip", async () => {
  const { resolvePackAppVersion, getPinnedInstallVersion } = await import(
    "../utils/installVersion.js"
  );
  const versions = [{ version: "2.0.0" }, { version: "1.2.0" }];

  assert.deepEqual(
    resolvePackAppVersion({ appVersion: "1.2.0", versions }),
    { displayVersion: "1.2.0", pinnedVersion: "1.2.0" }
  );

  assert.deepEqual(
    resolvePackAppVersion({ appVersion: "2.0.0", versions }),
    { displayVersion: "2.0.0", pinnedVersion: "2.0.0" }
  );

  assert.equal(
    getPinnedInstallVersion({ appVersion: "2.0.0", versions }),
    "2.0.0"
  );
});

test("resolvePackAppVersion falls back when pin missing from versions", async () => {
  const { resolvePackAppVersion, getPinnedInstallVersion } = await import(
    "../utils/installVersion.js"
  );
  const app = {
    appVersion: "0.9.0",
    versions: [{ version: "2.0.0" }, { version: "1.0.0" }],
  };

  assert.deepEqual(resolvePackAppVersion(app), {
    displayVersion: "2.0.0",
    pinnedVersion: "",
  });
  assert.equal(getPinnedInstallVersion(app), undefined);
});

test("resolvePackAppVersion trusts appVersion when versions absent", async () => {
  const { resolvePackAppVersion, getPinnedInstallVersion } = await import(
    "../utils/installVersion.js"
  );

  assert.deepEqual(resolvePackAppVersion({ appVersion: "1.2.0" }), {
    displayVersion: "1.2.0",
    pinnedVersion: "1.2.0",
  });

  assert.deepEqual(resolvePackAppVersion({ appVersion: "1.2.0", versions: [] }), {
    displayVersion: "1.2.0",
    pinnedVersion: "1.2.0",
  });

  assert.equal(
    getPinnedInstallVersion({ appVersion: "1.2.0" }),
    "1.2.0"
  );
});

test("getPinnedInstallVersion generate path omits tip without appVersion key", async () => {
  const { getPinnedInstallVersion } = await import("../utils/installVersion.js");

  assert.equal(
    getPinnedInstallVersion({
      selectedVersion: "2.0.0",
      versions: [{ version: "2.0.0" }, { version: "1.0.0" }],
    }),
    undefined
  );

  assert.equal(
    getPinnedInstallVersion({
      selectedVersion: "1.0.0",
      versions: [{ version: "2.0.0" }, { version: "1.0.0" }],
    }),
    "1.0.0"
  );
});
