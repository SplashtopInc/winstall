const test = require("node:test");
const assert = require("node:assert/strict");

function createStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    get size() {
      return map.size;
    },
  };
}

test("armSearchRecord writes only when the results path changes", async () => {
  const { armSearchRecord } = await import("../utils/searchQueryRecord.js");
  const now = 1_700_000_000_000;
  const storage = createStorage();

  assert.equal(
    armSearchRecord({
      currentPath: "/packs",
      nextPath: "/apps?q=firefox",
      text: "  firefox  ",
      now,
      storage,
    }),
    true
  );

  const stored = JSON.parse(storage.getItem("winstall.pendingSearchRecord"));
  assert.deepEqual(stored, { text: "firefox", expiresAt: now + 30_000 });

  const samePath = createStorage();
  assert.equal(
    armSearchRecord({
      currentPath: "/apps?q=name%3A+firefox",
      nextPath: "/apps?q=name%3A+firefox",
      text: "name: firefox",
      now,
      storage: samePath,
    }),
    false
  );
  assert.equal(samePath.getItem("winstall.pendingSearchRecord"), null);
});

test("consumeSearchRecord matches once, then drops expiry and other queries", async () => {
  const { armSearchRecord, consumeSearchRecord } = await import(
    "../utils/searchQueryRecord.js"
  );
  const now = 1_700_000_000_000;
  const storage = createStorage();

  armSearchRecord({
    currentPath: "/apps",
    nextPath: "/apps?q=firefox",
    text: "firefox",
    now,
    storage,
  });

  assert.equal(
    consumeSearchRecord({ pageQuery: "firefox", now: now + 1_000, storage }),
    true
  );
  assert.equal(storage.getItem("winstall.pendingSearchRecord"), null);
  assert.equal(
    consumeSearchRecord({ pageQuery: "firefox", now: now + 1_000, storage }),
    false
  );

  armSearchRecord({
    currentPath: "/apps",
    nextPath: "/apps?q=firefox",
    text: "firefox",
    now,
    storage,
  });
  assert.equal(
    consumeSearchRecord({ pageQuery: "chrome", now: now + 1_000, storage }),
    false
  );
  assert.equal(storage.size, 0);

  armSearchRecord({
    currentPath: "/apps",
    nextPath: "/apps?q=firefox",
    text: "firefox",
    now,
    storage,
  });
  assert.equal(
    consumeSearchRecord({ pageQuery: "firefox", now: now + 30_000, storage }),
    false
  );
  assert.equal(storage.size, 0);
});

test("searchRecordHeaders covers unsigned, fresh, and expired sessions", async () => {
  const { searchRecordHeaders } = await import("../utils/searchQueryRecord.js");
  const now = 1_700_000_000_000;
  const nowSeconds = Math.floor(now / 1000);

  assert.deepEqual(searchRecordHeaders({ recordSearch: false, apiToken: "jwt" }), {});
  assert.deepEqual(searchRecordHeaders({ recordSearch: true }), {
    "X-Search-Record": "1",
  });
  assert.deepEqual(
    searchRecordHeaders({
      recordSearch: true,
      apiToken: "jwt-fresh",
      apiTokenExpires: nowSeconds + 60,
      now,
    }),
    {
      "X-Search-Record": "1",
      Authorization: "Bearer jwt-fresh",
    }
  );
  assert.deepEqual(
    searchRecordHeaders({
      recordSearch: true,
      apiToken: "jwt-expired",
      apiTokenExpires: nowSeconds - 1,
      now,
    }),
    { "X-Search-Record": "1" }
  );
});
