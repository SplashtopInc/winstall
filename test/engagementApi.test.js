const test = require("node:test");
const assert = require("node:assert/strict");

test("mapStatsPayload maps API stats fields", async () => {
  const { mapStatsPayload } = await import("../utils/engagementStats.js");

  assert.deepEqual(
    mapStatsPayload({
      id: "Mozilla.Firefox",
      viewCount: 12400,
      downloadCount: 3100,
      likeCount: 428,
      liked: true,
    }),
    { views: 12400, downloads: 3100, likeCount: 428, liked: true }
  );

  assert.deepEqual(mapStatsPayload({ id: "x" }), {
    views: 0,
    downloads: 0,
    likeCount: 0,
    liked: false,
  });

  assert.equal(mapStatsPayload(null), null);
});

test("formatCount shortens thousands", async () => {
  const { formatCount } = await import("../utils/engagementStats.js");

  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(428), "428");
  assert.equal(formatCount(12400), "12.4K");
  assert.equal(formatCount(1000), "1K");
  assert.equal(formatCount(null), null);
});
