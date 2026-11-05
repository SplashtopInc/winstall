const test = require("node:test");
const assert = require("node:assert/strict");

test("normalizeFeedbackMessage trims, drops zero-width characters, and keeps newlines", async () => {
  const { normalizeFeedbackMessage } = await import("../utils/feedbackApi.js");

  assert.equal(normalizeFeedbackMessage("  installer failed  "), "installer failed");
  assert.equal(normalizeFeedbackMessage("installer\u200Bfailed"), "installerfailed");
  assert.equal(normalizeFeedbackMessage("line1\n\tline2"), "line1\n\tline2");
  assert.equal(normalizeFeedbackMessage("   \n  "), "");
  assert.equal(normalizeFeedbackMessage(null), "");
});

test("prepareFeedback rejects a blank or oversized note and emits only category and message", async () => {
  const { prepareFeedback, FEEDBACK_MESSAGE_MAX_LENGTH } = await import(
    "../utils/feedbackApi.js"
  );

  assert.deepEqual(prepareFeedback({ category: "bug", message: "   " }), {
    ok: false,
    reason: "empty",
  });

  assert.deepEqual(
    prepareFeedback({
      category: "bug",
      message: "a".repeat(FEEDBACK_MESSAGE_MAX_LENGTH + 1),
    }),
    { ok: false, reason: "length" }
  );

  assert.deepEqual(prepareFeedback({ category: "Bug", message: "installer failed" }), {
    ok: false,
    reason: "category",
  });

  const ready = prepareFeedback({
    category: "suggestion",
    message: "  add\u200B filters  ",
  });
  assert.equal(ready.ok, true);
  assert.deepEqual(ready.body, { category: "suggestion", message: "add filters" });
  assert.deepEqual(Object.keys(ready.body), ["category", "message"]);
});
