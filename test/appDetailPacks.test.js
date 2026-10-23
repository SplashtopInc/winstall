const test = require("node:test");
const assert = require("node:assert/strict");

test("readAppDetailPacks keeps order and stops at four", async () => {
  const { readAppDetailPacks } = await import("../utils/appDetailPacks.js");
  const data = ["a", "b", "c", "d", "e"].map((id) => ({ _id: id }));

  assert.deepEqual(
    readAppDetailPacks({ data }).map((item) => item._id),
    ["a", "b", "c", "d"]
  );
});

test("readAppDetailPacks returns an empty list without data", async () => {
  const { readAppDetailPacks } = await import("../utils/appDetailPacks.js");

  assert.deepEqual(readAppDetailPacks(null), []);
  assert.deepEqual(readAppDetailPacks({}), []);
  assert.deepEqual(readAppDetailPacks({ data: null }), []);
});

test("app detail pack count label uses one app or many apps", async () => {
  const { appDetailPackCountLabel } = await import("../utils/appDetailPacks.js");

  assert.equal(appDetailPackCountLabel(1), "1 app");
  assert.equal(appDetailPackCountLabel(0), "0 apps");
  assert.equal(appDetailPackCountLabel(46), "46 apps");
});

test("app detail packs path requests four and omits sort", async () => {
  const { appDetailPacksPath } = await import("../utils/appDetailPacks.js");
  const path = appDetailPacksPath("VideoLAN.VLC");
  const url = new URL(path, "https://winstall.app");

  assert.equal(url.pathname, "/apps/VideoLAN.VLC/packs");
  assert.equal(url.searchParams.get("limit"), "4");
  assert.equal(url.searchParams.has("sort"), false);
  assert.equal(url.searchParams.has("offset"), false);
});
