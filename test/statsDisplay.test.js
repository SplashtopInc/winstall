const test = require("node:test");
const assert = require("node:assert/strict");

test("isStatsDisplayEnabledValue is on only for 1 and true", async () => {
  const { isStatsDisplayEnabledValue } = await import("../utils/statsDisplay.js");

  assert.equal(isStatsDisplayEnabledValue(undefined), false);
  assert.equal(isStatsDisplayEnabledValue(null), false);
  assert.equal(isStatsDisplayEnabledValue(""), false);
  assert.equal(isStatsDisplayEnabledValue("  "), false);
  assert.equal(isStatsDisplayEnabledValue("0"), false);
  assert.equal(isStatsDisplayEnabledValue("false"), false);
  assert.equal(isStatsDisplayEnabledValue("FALSE"), false);
  assert.equal(isStatsDisplayEnabledValue("yes"), false);
  assert.equal(isStatsDisplayEnabledValue("2"), false);

  assert.equal(isStatsDisplayEnabledValue("1"), true);
  assert.equal(isStatsDisplayEnabledValue(" 1 "), true);
  assert.equal(isStatsDisplayEnabledValue("true"), true);
  assert.equal(isStatsDisplayEnabledValue("TRUE"), true);
});

test("browser reads winstall-show-stats meta only", async () => {
  const { isStatsDisplayEnabled } = await import("../utils/statsDisplay.js");
  const previous = process.env.WINSTALL_SHOW_STATS;
  process.env.WINSTALL_SHOW_STATS = "1";
  global.window = {};

  global.document = {
    querySelector(selector) {
      if (selector === 'meta[name="winstall-show-stats"]') {
        return { getAttribute: () => "0" };
      }
      return null;
    },
  };

  try {
    assert.equal(isStatsDisplayEnabled(), false);

    global.document = {
      querySelector() {
        return null;
      },
    };
    assert.equal(isStatsDisplayEnabled(), false);
  } finally {
    delete global.window;
    delete global.document;
    if (previous === undefined) {
      delete process.env.WINSTALL_SHOW_STATS;
    } else {
      process.env.WINSTALL_SHOW_STATS = previous;
    }
  }
});
