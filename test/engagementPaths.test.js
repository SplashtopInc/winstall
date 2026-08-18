const test = require("node:test");
const assert = require("node:assert/strict");

test("stats and like path matchers", async () => {
  const { isStatsPath, isLikePath } = await import(
    "../utils/engagementPaths.js"
  );

  assert.equal(isStatsPath("/apps/Microsoft.VisualStudioCode/stats"), true);
  assert.equal(isStatsPath("/packs/abc/stats"), true);
  assert.equal(isStatsPath("/packs/abc"), false);
  assert.equal(isStatsPath("/apps/Microsoft.VisualStudioCode"), false);

  assert.equal(isLikePath("/apps/Microsoft.VisualStudioCode/like"), true);
  assert.equal(isLikePath("/packs/abc/like"), true);
  assert.equal(isLikePath("/packs/abc/copy"), false);
  assert.equal(isLikePath("/likes"), false);
});
