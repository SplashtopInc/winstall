const test = require("node:test");
const assert = require("node:assert/strict");

test("readAppListCounts maps lifetime fields and defaults missing values to 0", async () => {
  const { readAppListCounts } = await import("../utils/appListCounts.js");

  assert.deepEqual(
    readAppListCounts({
      viewCount: 40,
      downloadCount: 12,
      likeCount: 3,
    }),
    { viewCount: 40, downloadCount: 12, likeCount: 3 }
  );

  assert.deepEqual(readAppListCounts({}), {
    viewCount: 0,
    downloadCount: 0,
    likeCount: 0,
  });

  assert.deepEqual(readAppListCounts(null), {
    viewCount: 0,
    downloadCount: 0,
    likeCount: 0,
  });
});

test("readAppListCounts accepts numeric strings and treats non-numbers as 0", async () => {
  const { readAppListCounts } = await import("../utils/appListCounts.js");

  assert.deepEqual(
    readAppListCounts({
      viewCount: "1200",
      downloadCount: "48",
      likeCount: "3",
    }),
    { viewCount: 1200, downloadCount: 48, likeCount: 3 }
  );

  assert.deepEqual(
    readAppListCounts({
      viewCount: "n/a",
      downloadCount: "",
      likeCount: undefined,
    }),
    { viewCount: 0, downloadCount: 0, likeCount: 0 }
  );
});

test("readAppListCounts does not fall back to weekly window fields", async () => {
  const { readAppListCounts } = await import("../utils/appListCounts.js");

  assert.deepEqual(
    readAppListCounts({
      views: 40,
      downloads: 12,
      likes: 3,
      viewCount: 900,
      downloadCount: 1200,
    }),
    { viewCount: 900, downloadCount: 1200, likeCount: 0 }
  );

  assert.deepEqual(
    readAppListCounts({
      views: 99,
      downloads: 88,
      likes: 77,
    }),
    { viewCount: 0, downloadCount: 0, likeCount: 0 }
  );
});
