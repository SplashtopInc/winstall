const test = require("node:test");
const assert = require("node:assert/strict");

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

test("quota body is usable only when both fields are integers", async () => {
  const { readPublicPackQuota } = await import("../utils/packLimits.js");

  assert.deepEqual(readPublicPackQuota({ publicCount: 3, maxPublic: 10 }), {
    publicCount: 3,
    maxPublic: 10,
  });
  assert.deepEqual(readPublicPackQuota({ publicCount: 10, maxPublic: 200 }), {
    publicCount: 10,
    maxPublic: 200,
  });
  assert.equal(readPublicPackQuota(null), null);
  assert.equal(readPublicPackQuota({ publicCount: 1 }), null);
  assert.equal(readPublicPackQuota({ publicCount: 1.5, maxPublic: 10 }), null);
  assert.equal(readPublicPackQuota({ publicCount: "3", maxPublic: 10 }), null);
});
