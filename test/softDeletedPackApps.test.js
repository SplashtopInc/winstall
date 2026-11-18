const test = require("node:test");
const assert = require("node:assert/strict");

async function load() {
  return import("../utils/isAppRemoved.js");
}

test("packAppAvailability separates removed from unavailable", async () => {
  const { packAppAvailability } = await load();

  assert.deepEqual(
    packAppAvailability({ available: true, deletedAt: null }),
    { unavailable: false, removed: false }
  );
  assert.deepEqual(
    packAppAvailability({
      available: true,
      deletedAt: "2026-03-03T00:00:00.000Z",
    }),
    { unavailable: false, removed: true }
  );
  assert.deepEqual(packAppAvailability({ available: false }), {
    unavailable: true,
    removed: false,
  });
});

test("installable pack apps exclude removed and unavailable", async () => {
  const { packAppAvailability } = await load();
  const apps = [
    { _id: "Live.App", available: true, deletedAt: null },
    {
      _id: "GitHub.Atom",
      available: true,
      deletedAt: "2026-03-03T00:00:00.000Z",
    },
    { _id: "Missing.App", available: false },
  ].map((app) => ({ ...app, ...packAppAvailability(app) }));

  assert.deepEqual(
    apps.filter((app) => !app.unavailable && !app.removed).map((app) => app._id),
    ["Live.App"]
  );
});
