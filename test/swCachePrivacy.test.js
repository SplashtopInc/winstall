const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../sw/cachePrivacy.js");

test("a request with Authorization is a credentialed request", async () => {
  const { hasUserCredentials } = await load();
  const request = new Request("https://api.example.com/packs/me", {
    headers: { Authorization: "Bearer token" },
  });

  assert.equal(hasUserCredentials(request), true);
});

test("the header name is matched case-insensitively", async () => {
  const { hasUserCredentials } = await load();
  const request = new Request("https://api.example.com/packs/me", {
    headers: { authorization: "Bearer token" },
  });

  assert.equal(hasUserCredentials(request), true);
});

test("a request without Authorization is not credentialed", async () => {
  const { hasUserCredentials } = await load();
  const request = new Request("https://api.example.com/apps/trending");

  assert.equal(hasUserCredentials(request), false);
});

test("an empty Authorization value still counts as credentialed", async () => {
  const { hasUserCredentials } = await load();
  // Design decision: presence of the header is enough, the value is ignored.
  const headers = new Headers();
  headers.set("Authorization", "");

  assert.equal(hasUserCredentials({ headers }), true);
});

test("the matcher does not depend on the request origin", async () => {
  const { hasUserCredentials } = await load();

  for (const url of [
    "https://api.example.com/packs/me",
    "https://other.example.org/anything",
    "http://localhost:3000/api/whatever",
  ]) {
    const request = new Request(url, { headers: { Authorization: "Bearer t" } });
    assert.equal(hasUserCredentials(request), true, url);
  }
});

test("a missing request is not credentialed", async () => {
  const { hasUserCredentials } = await load();

  assert.equal(hasUserCredentials(undefined), false);
  assert.equal(hasUserCredentials({}), false);
});

test("legacy cache names cover cross-origin and apis but never the precache", async () => {
  const { LEGACY_CACHE_NAMES } = await load();

  assert.ok(LEGACY_CACHE_NAMES.includes("cross-origin"));
  assert.ok(LEGACY_CACHE_NAMES.includes("apis"));
  for (const name of LEGACY_CACHE_NAMES) {
    assert.ok(!name.includes("precache"), `${name} must not be a precache name`);
  }
});

test("purgeLegacyCaches deletes every legacy cache and nothing else", async () => {
  const { purgeLegacyCaches, LEGACY_CACHE_NAMES } = await load();
  const deleted = [];
  const cacheStorage = {
    delete: async (name) => {
      deleted.push(name);
      return true;
    },
  };

  await purgeLegacyCaches(cacheStorage);

  assert.deepEqual([...deleted].sort(), [...LEGACY_CACHE_NAMES].sort());
});

test("purgeLegacyCaches keeps going and does not reject when one delete fails", async () => {
  const { purgeLegacyCaches, LEGACY_CACHE_NAMES } = await load();
  const deleted = [];
  const cacheStorage = {
    delete: async (name) => {
      if (name === LEGACY_CACHE_NAMES[0]) throw new Error("boom");
      deleted.push(name);
      return true;
    },
  };
  const originalWarn = console.warn;
  console.warn = () => {};

  try {
    await assert.doesNotReject(purgeLegacyCaches(cacheStorage));
  } finally {
    console.warn = originalWarn;
  }

  assert.deepEqual(deleted, LEGACY_CACHE_NAMES.slice(1));
});
