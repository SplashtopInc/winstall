const test = require("node:test");
const assert = require("node:assert/strict");

test("my packs and public quota require a user JWT", async () => {
  const { requiresUserPackReadJwt } = await import("../utils/userPackReads.js");

  assert.equal(requiresUserPackReadJwt("GET", "/packs/me"), true);
  assert.equal(requiresUserPackReadJwt("GET", "/packs/me/quota"), true);
});

test("a longer path under my packs is not forced to carry a JWT", async () => {
  const { requiresUserPackReadJwt } = await import("../utils/userPackReads.js");

  assert.equal(requiresUserPackReadJwt("GET", "/packs/me/other"), false);
});
