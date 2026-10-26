const test = require("node:test");
const assert = require("node:assert/strict");

test("buildPackBadgeMarkdown matches the winstall.app sample", async () => {
  const { buildPackBadgeMarkdown } = await import("../utils/packBadgeMarkdown.js");
  const shareUrl = "https://winstall.app/packs/cJL66qrefbvuG1U7_fZ-h";

  assert.equal(
    buildPackBadgeMarkdown(shareUrl),
    "[![Open in winstall](https://winstall.app/badge.svg)](https://winstall.app/packs/cJL66qrefbvuG1U7_fZ-h)"
  );
});

test("buildPackBadgeMarkdown uses the same origin as the pack link", async () => {
  const { buildPackBadgeMarkdown } = await import("../utils/packBadgeMarkdown.js");
  const shareUrl = "https://example.test/packs/abc";

  assert.equal(
    buildPackBadgeMarkdown(shareUrl),
    "[![Open in winstall](https://example.test/badge.svg)](https://example.test/packs/abc)"
  );
});
