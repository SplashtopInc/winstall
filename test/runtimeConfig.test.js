const test = require("node:test");
const assert = require("node:assert/strict");

test("parseOnOffEnv defaults on and accepts common flags", async () => {
  const { parseOnOffEnv } = await import("../utils/runtimeConfig.js");

  assert.equal(parseOnOffEnv(undefined), true);
  assert.equal(parseOnOffEnv(""), true);
  assert.equal(parseOnOffEnv("true"), true);
  assert.equal(parseOnOffEnv("1"), true);
  assert.equal(parseOnOffEnv("on"), true);
  assert.equal(parseOnOffEnv("false"), false);
  assert.equal(parseOnOffEnv("0"), false);
  assert.equal(parseOnOffEnv("off"), false);
  assert.equal(parseOnOffEnv("NO"), false);
});

function restoreApiEnv(snapshot) {
  if (snapshot.public === undefined) {
    delete process.env.WINSTALL_API_BASE;
  } else {
    process.env.WINSTALL_API_BASE = snapshot.public;
  }
  if (snapshot.internal === undefined) {
    delete process.env.WINSTALL_API_INTERNAL_BASE;
  } else {
    process.env.WINSTALL_API_INTERNAL_BASE = snapshot.internal;
  }
}

test.describe("getRuntimeConfig API origins", { concurrency: false }, () => {
  let snapshot;

  test.beforeEach(() => {
    snapshot = {
      public: process.env.WINSTALL_API_BASE,
      internal: process.env.WINSTALL_API_INTERNAL_BASE,
    };
    delete process.env.WINSTALL_API_BASE;
    delete process.env.WINSTALL_API_INTERNAL_BASE;
    delete global.window;
    delete global.document;
  });

  test.afterEach(() => {
    restoreApiEnv(snapshot);
    delete global.window;
    delete global.document;
  });

  test("server uses public origin when internal is unset", async () => {
    const { getPublicApiBase, getRuntimeConfig } = await import(
      "../utils/runtimeConfig.js"
    );
    process.env.WINSTALL_API_BASE = " https://test-api.winstall.app ";

    assert.equal(getPublicApiBase(), "https://test-api.winstall.app");
    const config = await getRuntimeConfig();
    assert.equal(config.apiBase, "https://test-api.winstall.app");
  });

  test("server prefers non-empty internal origin over public", async () => {
    const { getPublicApiBase, getRuntimeConfig } = await import(
      "../utils/runtimeConfig.js"
    );
    process.env.WINSTALL_API_BASE = "https://test-api.winstall.app";
    process.env.WINSTALL_API_INTERNAL_BASE = " http://winstall-api:3100 ";

    assert.equal(getPublicApiBase(), "https://test-api.winstall.app");
    const config = await getRuntimeConfig();
    assert.equal(config.apiBase, "http://winstall-api:3100");
  });

  test("server uses internal when public is unset", async () => {
    const { getPublicApiBase, getRuntimeConfig } = await import(
      "../utils/runtimeConfig.js"
    );
    process.env.WINSTALL_API_INTERNAL_BASE = "http://winstall-api:3100";

    assert.equal(getPublicApiBase(), "");
    const config = await getRuntimeConfig();
    assert.equal(config.apiBase, "http://winstall-api:3100");
  });

  test("server falls back to public when internal is blank", async () => {
    const { getPublicApiBase, getRuntimeConfig } = await import(
      "../utils/runtimeConfig.js"
    );
    process.env.WINSTALL_API_BASE = "https://test-api.winstall.app";
    process.env.WINSTALL_API_INTERNAL_BASE = "   ";

    assert.equal(getPublicApiBase(), "https://test-api.winstall.app");
    const config = await getRuntimeConfig();
    assert.equal(config.apiBase, "https://test-api.winstall.app");
  });

  test("browser apiBase reads meta and ignores internal env", async () => {
    const { getRuntimeConfig } = await import("../utils/runtimeConfig.js");
    process.env.WINSTALL_API_BASE = "https://test-api.winstall.app";
    process.env.WINSTALL_API_INTERNAL_BASE = "http://winstall-api:3100";

    global.window = {};
    global.document = {
      querySelector(selector) {
        if (selector === 'meta[name="winstall-api-base"]') {
          return { getAttribute: () => "https://test-api.winstall.app" };
        }
        return null;
      },
    };

    const config = await getRuntimeConfig();
    assert.equal(config.apiBase, "https://test-api.winstall.app");
  });
});
