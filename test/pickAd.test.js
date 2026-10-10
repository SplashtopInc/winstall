const test = require("node:test");
const assert = require("node:assert/strict");

const bannerAds = [
  { id: "sba-1", product: "SBA", enabled: true },
  { id: "sba-2", product: "SBA", enabled: true },
  { id: "aem-1", product: "AEM", enabled: true },
  { id: "ent-1", product: "ENT", enabled: true },
];

function productsOf(selected) {
  return selected.map((ad) => ad.product);
}

test("selectDistinctProductAds never pairs two creatives of one product", async () => {
  const { selectDistinctProductAds } = await import("../utils/pickAd.js");

  for (let i = 0; i < 40; i += 1) {
    const selected = selectDistinctProductAds(bannerAds);
    assert.equal(selected.length, 2);
    assert.equal(new Set(productsOf(selected)).size, 2);
    const sbaCount = selected.filter((ad) => ad.product === "SBA").length;
    assert.ok(sbaCount <= 1);
  }
});

test("selectDistinctProductAds returns one ad when every creative shares a product", async () => {
  const { selectDistinctProductAds } = await import("../utils/pickAd.js");
  const ads = [
    { id: "sba-1", product: "SBA", enabled: true },
    { id: "sba-2", product: " SBA ", enabled: true },
  ];

  const selected = selectDistinctProductAds(ads, 2, () => 0);
  assert.equal(selected.length, 1);
  assert.equal(selected[0].product.trim(), "SBA");
});

test("selectDistinctProductAds treats a blank product as its own group", async () => {
  const { selectDistinctProductAds } = await import("../utils/pickAd.js");
  const ads = [
    { id: "bare-1", product: "   ", enabled: true },
    { id: "bare-2", enabled: true },
  ];

  const selected = selectDistinctProductAds(ads, 2, () => 0);
  assert.deepEqual(
    selected.map((ad) => ad.id).sort(),
    ["bare-1", "bare-2"]
  );
});

function installSession() {
  const store = new Map();
  globalThis.window = {};
  globalThis.sessionStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
  return store;
}

function clearSession() {
  delete globalThis.window;
  delete globalThis.sessionStorage;
}

test.describe("home banner session", { concurrency: false }, () => {
  test("pickHomeBannerAds redraws a cached pair that shares a product", async () => {
    const { pickHomeBannerAds, BANNER_SESSION_KEY } = await import(
      "../utils/pickAd.js"
    );
    const store = installSession();
    store.set(BANNER_SESSION_KEY, JSON.stringify(["sba-1", "sba-2"]));

    try {
      const selected = pickHomeBannerAds(bannerAds);
      assert.equal(selected.length, 2);
      assert.equal(new Set(productsOf(selected)).size, 2);
      const stored = JSON.parse(store.get(BANNER_SESSION_KEY));
      assert.deepEqual(
        stored,
        selected.map((ad) => ad.id)
      );
      assert.notDeepEqual(stored, ["sba-1", "sba-2"]);
    } finally {
      clearSession();
    }
  });

  test("pickHomeBannerAds keeps a cached pair from different products", async () => {
    const { pickHomeBannerAds, BANNER_SESSION_KEY } = await import(
      "../utils/pickAd.js"
    );
    const store = installSession();
    store.set(BANNER_SESSION_KEY, JSON.stringify(["ent-1", "aem-1"]));

    try {
      const selected = pickHomeBannerAds(bannerAds);
      assert.deepEqual(
        selected.map((ad) => ad.id),
        ["ent-1", "aem-1"]
      );
      assert.equal(store.get(BANNER_SESSION_KEY), JSON.stringify(["ent-1", "aem-1"]));
    } finally {
      clearSession();
    }
  });

  test("pickHomeBannerAds returns nothing on the server", async () => {
    const { pickHomeBannerAds } = await import("../utils/pickAd.js");
    clearSession();
    assert.deepEqual(pickHomeBannerAds(bannerAds), []);
  });
});
