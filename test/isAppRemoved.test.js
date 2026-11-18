const test = require("node:test");
const assert = require("node:assert/strict");

async function load() {
  return import("../utils/isAppRemoved.js");
}

test("isAppRemoved is true only when deletedAt is set", async () => {
  const { isAppRemoved } = await load();

  assert.equal(isAppRemoved(null), false);
  assert.equal(isAppRemoved({}), false);
  assert.equal(isAppRemoved({ deletedAt: null }), false);
  assert.equal(isAppRemoved({ deletedAt: "2026-03-03T00:00:00.000Z" }), true);
});

test("formatRemovedOn uses the UTC calendar date", async () => {
  const { formatRemovedOn } = await load();

  assert.equal(formatRemovedOn("2026-03-03T00:00:00.000Z"), "March 3, 2026");
  assert.equal(formatRemovedOn("not-a-date"), "");
});

test("removed app document title omits Download", async () => {
  const { removedAppDocumentTitle, removedAppDocumentDescription } = await load();

  assert.equal(removedAppDocumentTitle("Atom"), "Atom | winstall");
  assert.equal(
    removedAppDocumentDescription("Atom"),
    "Atom was removed from the winget repository and can no longer be installed."
  );
  assert.equal(removedAppDocumentTitle("Atom").includes("Download"), false);
});
