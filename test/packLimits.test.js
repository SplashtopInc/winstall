const test = require("node:test");
const assert = require("node:assert/strict");

test("ops account public pack limit is 200", async () => {
  const { publicPackLimitForUser } = await import("../utils/packLimits.js");

  assert.equal(publicPackLimitForUser("ops-user", "ops-user"), 200);
});

test("padded ops account id still resolves to 200", async () => {
  const { publicPackLimitForUser } = await import("../utils/packLimits.js");

  assert.equal(publicPackLimitForUser("ops-user", "  ops-user  "), 200);
});

test("other users stay at 10 public packs", async () => {
  const { publicPackLimitForUser } = await import("../utils/packLimits.js");

  assert.equal(publicPackLimitForUser("someone-else", "ops-user"), 10);
});

test("missing or blank ops id keeps the limit at 10", async () => {
  const { publicPackLimitForUser } = await import("../utils/packLimits.js");

  assert.equal(publicPackLimitForUser("ops-user", undefined), 10);
  assert.equal(publicPackLimitForUser("ops-user", null), 10);
  assert.equal(publicPackLimitForUser("ops-user", ""), 10);
  assert.equal(publicPackLimitForUser("ops-user", "   "), 10);
});

test("blank ops id does not match a blank user id", async () => {
  const { publicPackLimitForUser } = await import("../utils/packLimits.js");

  assert.equal(publicPackLimitForUser("", ""), 10);
  assert.equal(publicPackLimitForUser("", "   "), 10);
  assert.equal(publicPackLimitForUser(undefined, undefined), 10);
});

test("limit message includes the cap that applies", async () => {
  const { publicPackLimitMessage } = await import("../utils/packLimits.js");

  assert.equal(
    publicPackLimitMessage(10),
    "Public pack limit reached (10). Unpublish or delete a pack to continue."
  );
  assert.equal(
    publicPackLimitMessage(200),
    "Public pack limit reached (200). Unpublish or delete a pack to continue."
  );
});
