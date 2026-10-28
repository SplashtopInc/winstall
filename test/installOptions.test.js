const test = require("node:test");
const assert = require("node:assert/strict");

const QUOTE_BREAK = 'x" & calc & echo "';
const SUBEXPRESSION = "$(calc)";
const SAFE_OVERRIDE = "/quiet";
const SAFE_LOCATION = "C:\\Program Files (x86)\\Apps";
const SAFE_LOG = "C:\\logs\\install.log";

test("unsafe override and subexpression are dropped from quoted flags", async () => {
  const { normalizeInstallOptions, quoteWingetValue } = await import(
    "../utils/installOptions.js"
  );

  for (const value of [QUOTE_BREAK, SUBEXPRESSION]) {
    const normalized = normalizeInstallOptions({
      override: value,
      log: value,
      location: value,
    });
    assert.equal(normalized.override, undefined);
    assert.equal(normalized.log, undefined);
    assert.equal(normalized.location, undefined);

    for (const flag of ["--override", "--log", "--location"]) {
      const path = flag !== "--override";
      const quoted = quoteWingetValue(flag, value, { path });
      assert.equal(quoted, "");
      assert.equal(quoted.includes("calc"), false);
    }
  }
});

test("non-path and overlong log and location are dropped", async () => {
  const { normalizeInstallOptions, quoteWingetValue } = await import(
    "../utils/installOptions.js"
  );

  const overlong = `C:\\${"a".repeat(258)}`;
  assert.ok(overlong.length > 260);

  for (const value of ["not-a-path", "..\\windows", overlong]) {
    const normalized = normalizeInstallOptions({ log: value, location: value });
    assert.equal(normalized.log, undefined);
    assert.equal(normalized.location, undefined);
    assert.equal(quoteWingetValue("--log", value, { path: true }), "");
    assert.equal(quoteWingetValue("--location", value, { path: true }), "");
  }
});

test("safe override and Windows path are kept", async () => {
  const { normalizeInstallOptions, quoteWingetValue } = await import(
    "../utils/installOptions.js"
  );

  const normalized = normalizeInstallOptions({
    override: `  ${SAFE_OVERRIDE}  `,
    location: SAFE_LOCATION,
  });

  assert.equal(normalized.override, SAFE_OVERRIDE);
  assert.equal(normalized.location, SAFE_LOCATION);
  assert.equal(
    quoteWingetValue("--override", SAFE_OVERRIDE),
    `--override "${SAFE_OVERRIDE}"`
  );
  assert.equal(
    quoteWingetValue("--location", SAFE_LOCATION, { path: true }),
    `--location "${SAFE_LOCATION}"`
  );
});

test("unsafe override does not drop force, and the drawer clears only the bad field", async () => {
  const {
    normalizeInstallOptions,
    installOptionsToWingetFlags,
    installOptionsToDrawerConfig,
  } = await import("../utils/installOptions.js");

  const normalized = normalizeInstallOptions({
    force: true,
    override: QUOTE_BREAK,
    log: SAFE_LOG,
  });
  assert.equal(normalized.force, true);
  assert.equal(normalized.override, undefined);
  assert.equal(normalized.log, SAFE_LOG);

  const flags = installOptionsToWingetFlags({
    force: true,
    override: QUOTE_BREAK,
  });
  assert.equal(flags["--force"], true);
  assert.equal(Object.hasOwn(flags, "--override"), false);

  const drawer = installOptionsToDrawerConfig({
    override: QUOTE_BREAK,
    log: SAFE_LOG,
  });
  assert.equal(drawer["--override"], "");
  assert.equal(drawer["--log"], SAFE_LOG);
});

test("installer config omits an unsafe override and keeps a safe location", async () => {
  const { buildInstallerConfig } = await import(
    "../utils/downloadInstantInstaller.js"
  );

  const config = buildInstallerConfig([
    {
      name: "Example",
      _id: "Example.App",
      installOptions: {
        override: QUOTE_BREAK,
        location: SAFE_LOCATION,
      },
    },
  ]);

  assert.equal(Object.hasOwn(config.apps[0].options, "override"), false);
  assert.equal(config.apps[0].options.location, SAFE_LOCATION);
});
