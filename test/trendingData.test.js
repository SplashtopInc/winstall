const test = require("node:test");
const assert = require("node:assert/strict");

test("normalizeTrendingResponse treats missing or malformed data as empty", async () => {
  const { isTrendingPath, normalizeTrendingResponse } = await import(
    "../utils/trendingData.js"
  );

  assert.equal(isTrendingPath("/apps/trending"), true);
  assert.equal(isTrendingPath("/packs/trending"), true);
  assert.equal(isTrendingPath("/packs/example"), false);

  assert.deepEqual(normalizeTrendingResponse(null), {
    generatedAt: null,
    items: [],
  });
  assert.deepEqual(normalizeTrendingResponse({ data: {} }), {
    generatedAt: null,
    items: [],
  });
  assert.deepEqual(
    normalizeTrendingResponse({
      generatedAt: "2026-08-28T00:00:00.000Z",
      data: [{ _id: "app.one", rank: 1 }],
    }),
    {
      generatedAt: "2026-08-28T00:00:00.000Z",
      items: [{ _id: "app.one", rank: 1 }],
    }
  );
});

test("readTrendingCounts uses weekly window fields not lifetime totals", async () => {
  const { readTrendingCounts } = await import("../utils/trendingData.js");

  assert.deepEqual(
    readTrendingCounts({
      likes: 3,
      downloads: 12,
      views: 40,
      likeCount: 900,
      downloadCount: 1200,
    }),
    { likes: 3, downloads: 12, views: 40 }
  );
  assert.deepEqual(readTrendingCounts({}), {
    likes: 0,
    downloads: 0,
    views: 0,
  });
});

test("normalizeTrendingPack maps API names for PackPreview", async () => {
  const { normalizeTrendingPack } = await import(
    "../utils/trendingData.js"
  );

  assert.deepEqual(
    normalizeTrendingPack({
      _id: "pack-one",
      name: "Essentials",
      description: "Useful apps",
      apps: [{ appId: "app.one", appName: "One", icon: "one.png" }],
    }),
    {
      _id: "pack-one",
      name: "Essentials",
      description: "Useful apps",
      title: "Essentials",
      desc: "Useful apps",
      apps: [
        {
          appId: "app.one",
          appName: "One",
          _id: "app.one",
          name: "One",
          icon: "one.png",
        },
      ],
    }
  );
});
