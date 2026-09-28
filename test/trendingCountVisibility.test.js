const test = require("node:test");
const assert = require("node:assert/strict");

test("isTrendingCountVisible requires finite values at or above 100", async () => {
  const {
    TRENDING_COUNT_MIN_VISIBLE,
    isTrendingCountVisible,
  } = await import("../utils/trendingCountVisibility.js");

  assert.equal(TRENDING_COUNT_MIN_VISIBLE, 100);
  assert.equal(isTrendingCountVisible(100), true);
  assert.equal(isTrendingCountVisible(240), true);
  assert.equal(isTrendingCountVisible("150"), true);

  assert.equal(isTrendingCountVisible(99), false);
  assert.equal(isTrendingCountVisible(80), false);
  assert.equal(isTrendingCountVisible(0), false);
  assert.equal(isTrendingCountVisible(null), false);
  assert.equal(isTrendingCountVisible(undefined), false);
  assert.equal(isTrendingCountVisible(""), false);
  assert.equal(isTrendingCountVisible("nope"), false);
  assert.equal(isTrendingCountVisible(Number.NaN), false);
});

test("mixed trending counts match home visibility rule", async () => {
  const { isTrendingCountVisible } = await import(
    "../utils/trendingCountVisibility.js"
  );

  const mixed = { viewCount: 240, downloadCount: 80, likeCount: 0 };
  assert.equal(isTrendingCountVisible(mixed.viewCount), true);
  assert.equal(isTrendingCountVisible(mixed.downloadCount), false);
  assert.equal(isTrendingCountVisible(mixed.likeCount), false);

  const allLow = { viewCount: 12, downloadCount: 3, likeCount: 0 };
  assert.equal(
    [allLow.viewCount, allLow.downloadCount, allLow.likeCount].some(
      isTrendingCountVisible
    ),
    false
  );
});
