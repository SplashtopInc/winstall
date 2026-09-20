import test from "node:test";
import assert from "node:assert/strict";
import {
  getAppLetter,
  getAppLetterBackground,
} from "../utils/appLetterIcon.js";

test("getAppLetter takes first letter from English name", () => {
  assert.equal(
    getAppLetter({ name: "Visual Studio Code", id: "Microsoft.VisualStudioCode" }),
    "V"
  );
});

test("getAppLetter accepts digit from 7-Zip", () => {
  assert.equal(getAppLetter({ name: "7-Zip", id: "7zip.7zip" }), "7");
});

test("getAppLetter keeps CJK character", () => {
  assert.equal(getAppLetter({ name: "微信", id: "Tencent.WeChat" }), "微");
});

test("getAppLetter falls back to last id segment", () => {
  assert.equal(getAppLetter({ name: "", id: "Publisher.AppName" }), "A");
  assert.equal(getAppLetter({ name: "...", id: "Publisher.AppName" }), "A");
});

test("getAppLetter returns empty when nothing visible", () => {
  assert.equal(getAppLetter({ name: "", id: "" }), "");
  assert.equal(getAppLetter({ name: "---", id: "..." }), "");
});

test("getAppLetterBackground is stable for the same id", () => {
  const a = getAppLetterBackground("Publisher.AppName");
  const b = getAppLetterBackground("Publisher.AppName");
  assert.equal(a, b);
  assert.match(a, /^#[0-9a-f]{6}$/i);
});

test("getAppLetterBackground differs across ids and falls back without id", () => {
  const fallback = getAppLetterBackground("");
  assert.equal(fallback, "#64748b");
  assert.notEqual(
    getAppLetterBackground("Alpha.One"),
    getAppLetterBackground("Beta.Two")
  );
});
