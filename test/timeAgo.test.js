const test = require("node:test");
const assert = require("node:assert/strict");

const NOW = Date.parse("2026-09-20T09:00:00.000Z");

function isoSecondsAgo(seconds) {
  return new Date(NOW - seconds * 1000).toISOString();
}

test("timeAgo treats clock skew and sub-minute as just now", async () => {
  const { timeAgo } = await import("../utils/helpers.js");

  assert.equal(timeAgo(isoSecondsAgo(-1), NOW), "just now");
  assert.equal(timeAgo(isoSecondsAgo(0), NOW), "just now");
  assert.equal(timeAgo(isoSecondsAgo(59), NOW), "just now");
});

test("timeAgo uses a single relative unit", async () => {
  const { timeAgo } = await import("../utils/helpers.js");

  assert.equal(timeAgo(isoSecondsAgo(60), NOW), "1 minute ago");
  assert.equal(timeAgo(isoSecondsAgo(59 * 60), NOW), "59 minutes ago");
  assert.equal(timeAgo(isoSecondsAgo(60 * 60), NOW), "1 hour ago");
  assert.equal(timeAgo(isoSecondsAgo(23 * 60 * 60), NOW), "23 hours ago");
  assert.equal(timeAgo(isoSecondsAgo(24 * 60 * 60), NOW), "1 day ago");
  assert.equal(timeAgo(isoSecondsAgo(6 * 24 * 60 * 60), NOW), "6 days ago");
  assert.equal(timeAgo(isoSecondsAgo(7 * 24 * 60 * 60), NOW), "1 week ago");
  assert.equal(timeAgo(isoSecondsAgo(29 * 24 * 60 * 60), NOW), "4 weeks ago");
  assert.equal(timeAgo(isoSecondsAgo(30 * 24 * 60 * 60), NOW), "1 month ago");
  assert.equal(timeAgo(isoSecondsAgo(364 * 24 * 60 * 60), NOW), "12 months ago");
  assert.equal(timeAgo(isoSecondsAgo(365 * 24 * 60 * 60), NOW), "1 year ago");
  assert.equal(timeAgo(isoSecondsAgo(800 * 24 * 60 * 60), NOW), "2 years ago");
});

test("timeAgo does not fall back to a calendar date", async () => {
  const { timeAgo } = await import("../utils/helpers.js");

  assert.equal(timeAgo(isoSecondsAgo(40 * 24 * 60 * 60), NOW), "1 month ago");
  assert.match(timeAgo(isoSecondsAgo(400 * 24 * 60 * 60), NOW), /^\d+ years? ago$/);
});

test("timeAgo returns an em dash for invalid dates", async () => {
  const { timeAgo } = await import("../utils/helpers.js");

  assert.equal(timeAgo("not-a-date", NOW), "—");
});
