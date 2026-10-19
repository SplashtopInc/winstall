const test = require("node:test");
const assert = require("node:assert/strict");

test("stats and like path matchers", async () => {
  const { isStatsPath, isLikePath, isLikedListPath } = await import(
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
  assert.equal(isLikePath("/apps/liked"), false);
  assert.equal(isLikePath("/packs/liked"), false);

  assert.equal(isLikedListPath("/apps/liked"), true);
  assert.equal(isLikedListPath("/packs/liked"), true);
  assert.equal(isLikedListPath("/apps/liked/like"), false);
  assert.equal(isLikedListPath("/apps/foo/liked"), false);
  assert.equal(isLikedListPath("/likes"), false);
});
