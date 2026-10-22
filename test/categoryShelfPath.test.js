const test = require("node:test");
const assert = require("node:assert/strict");

test("shelf paths and titles use the existing labels", async () => {
  const {
    SHELF_SLUGS,
    categoryDocumentTitle,
    categoryPagePath,
  } = await import("../utils/categoryShelfPath.js");
  const { CATEGORY_LABELS, CATEGORY_SLUGS } = await import(
    "../utils/categoryMeta.js"
  );

  assert.equal(SHELF_SLUGS.length, 14);
  assert.deepEqual(CATEGORY_SLUGS, ["all", ...SHELF_SLUGS]);
  assert.equal(categoryPagePath("all"), "/category");
  assert.equal(categoryPagePath("nope"), "/category");
  assert.equal(categoryDocumentTitle("all"), "Apps by Category - winstall");
  assert.equal(categoryPagePath("cloud_storage"), "/category/cloud_storage");
  assert.equal(
    categoryDocumentTitle("cloud_storage"),
    "Cloud Storage - winstall"
  );

  for (const slug of SHELF_SLUGS) {
    assert.equal(categoryPagePath(slug), `/category/${slug}`);
    assert.equal(
      categoryDocumentTitle(slug),
      `${CATEGORY_LABELS[slug]} - winstall`
    );
  }

  assert.equal(categoryDocumentTitle("browser"), "Browsers - winstall");
  assert.equal(
    categoryDocumentTitle("development"),
    "Developer Tools - winstall"
  );
});

test("known category queries redirect without keeping the category parameter", async () => {
  const { SHELF_SLUGS, categoryQueryRedirectPath } = await import(
    "../utils/categoryShelfPath.js"
  );

  assert.equal(categoryQueryRedirectPath("nope"), null);
  assert.equal(categoryQueryRedirectPath("others"), null);
  assert.equal(categoryQueryRedirectPath("all"), "/category");

  for (const slug of SHELF_SLUGS) {
    const path = categoryQueryRedirectPath(slug);
    assert.equal(path, `/category/${slug}`);
    assert.equal(new URL(path, "https://winstall.app").search, "");
  }
});
