const test = require("node:test");
const assert = require("node:assert/strict");

const pinnedApp = {
  name: "WeChat",
  _id: "Tencent.WeChat",
  versions: [{ version: "3.9.0" }, { version: "3.8.0" }],
  appVersion: "3.8.0",
};

const unpinnedApp = {
  name: "WeChat",
  _id: "Tencent.WeChat",
  versions: [{ version: "3.9.0" }, { version: "3.8.0" }],
  selectedVersion: "3.9.0",
};

test("default and explicit install keep a pinned version", async () => {
  const { buildInstallerConfig } = await import("../utils/downloadInstantInstaller.js");

  for (const config of [
    buildInstallerConfig([pinnedApp], { "--force": true }),
    buildInstallerConfig([pinnedApp], { "--force": true }, "install"),
  ]) {
    assert.equal(config.version, "0.0.1");
    assert.equal(config.apps.length, 1);
    assert.equal(config.apps[0].command, "install");
    assert.equal(config.apps[0].id, "Tencent.WeChat");
    assert.equal(config.apps[0].version, "3.8.0");
    assert.deepEqual(config.apps[0].options, { silent: true, force: true });
  }
});

test("unpinned install omits the package version", async () => {
  const { buildInstallerConfig } = await import("../utils/downloadInstantInstaller.js");
  const config = buildInstallerConfig([unpinnedApp]);

  assert.equal(config.version, "0.0.1");
  assert.equal(config.apps[0].command, "install");
  assert.equal(Object.hasOwn(config.apps[0], "version"), false);
});

test("upgrade omits a pinned package version", async () => {
  const { buildInstallerConfig } = await import("../utils/downloadInstantInstaller.js");
  const config = buildInstallerConfig([pinnedApp, { ...pinnedApp, _id: "Git.Git" }], {}, "upgrade");

  assert.equal(config.version, "0.0.1");
  for (const app of config.apps) {
    assert.equal(app.command, "upgrade");
    assert.equal(Object.hasOwn(app, "version"), false);
    assert.deepEqual(app.options, { silent: true });
  }
});

test("install after upgrade uses the same pin", async () => {
  const { buildInstallerConfig } = await import("../utils/downloadInstantInstaller.js");

  const upgraded = buildInstallerConfig([pinnedApp], {}, "upgrade");
  const installed = buildInstallerConfig([pinnedApp], {}, "install");

  assert.equal(Object.hasOwn(upgraded.apps[0], "version"), false);
  assert.equal(installed.apps[0].command, "install");
  assert.equal(installed.apps[0].version, "3.8.0");
});
