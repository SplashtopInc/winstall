const test = require("node:test");
const assert = require("node:assert/strict");

test("mapStatsPayload maps API stats fields without liked", async () => {
  const { mapStatsPayload } = await import("../utils/engagementStats.js");

  assert.deepEqual(
    mapStatsPayload({
      id: "Mozilla.Firefox",
      viewCount: 12400,
      downloadCount: 3100,
      likeCount: 428,
      liked: true,
    }),
    { views: 12400, downloads: 3100, likeCount: 428 }
  );

  assert.deepEqual(mapStatsPayload({ id: "x" }), {
    views: 0,
    downloads: 0,
    likeCount: 0,
  });

  assert.equal(mapStatsPayload(null), null);
});

test("mapLikePayload maps liked and likeCount", async () => {
  const { mapLikePayload } = await import("../utils/engagementStats.js");

  assert.deepEqual(
    mapLikePayload({ id: "Mozilla.Firefox", liked: true, likeCount: 428 }),
    { liked: true, likeCount: 428 }
  );

  assert.deepEqual(mapLikePayload({ id: "x", liked: false, likeCount: 0 }), {
    liked: false,
    likeCount: 0,
  });

  assert.equal(mapLikePayload(null), null);
});

test("formatCount shortens with K M B", async () => {
  const { formatCount } = await import("../utils/engagementStats.js");

  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(428), "428");
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(1000), "1K");
  assert.equal(formatCount(12400), "12.4K");
  assert.equal(formatCount(1500000), "1.5M");
  assert.equal(formatCount(1e9), "1B");
  assert.equal(formatCount(999950), "1M");
  assert.equal(formatCount(null), null);
});
