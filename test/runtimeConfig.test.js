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
