import test from "node:test";
import assert from "node:assert/strict";
import { storyWashTint, parseHexColor, toHexColor } from "../utils/iconAccent.js";

test("storyWashTint lifts very dark brands", () => {
  const washed = storyWashTint("#111111");
  const [r, g, b] = parseHexColor(washed);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  assert.ok(luminance > 0.28);
});

test("storyWashTint keeps mid brand hues recognizable", () => {
  const washed = storyWashTint("#1DB954");
  const [r, g, b] = parseHexColor(washed);
  assert.ok(g > r);
  assert.ok(g > b);
});

test("toHexColor clamps and formats", () => {
  assert.equal(toHexColor([15, 300, -4]), "#0fff00");
});
