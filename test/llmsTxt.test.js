const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const llmsPath = path.join(root, "public", "llms.txt");

const REQUIRED_LINKS = [
  "https://winstall.app/",
  "https://winstall.app/about",
  "https://winstall.app/eli5",
  "https://winstall.app/apps",
  "https://winstall.app/express",
  "https://winstall.app/category",
  "https://winstall.app/packs",
  "https://winstall.app/generate",
  "https://winstall.app/compare",
  "https://winstall.app/compare-ninite",
  "https://winstall.app/compare-chocolatey",
  "https://winstall.app/compare-unigetui",
  "https://winstall.app/sitemap.xml",
  "https://winstall.app/privacy",
];

const LINK_LINE = /^- \[([^\]]+)\]\((https:\/\/[^)\s]+)\)(?::\s*(\S.*))?$/;

function readLlms() {
  return fs.readFileSync(llmsPath, "utf8");
}

function parseLinks(text) {
  return text
    .split("\n")
    .map((line) => line.match(LINK_LINE))
    .filter(Boolean)
    .map((match) => ({
      title: match[1],
      url: match[2],
      description: match[3] || "",
    }));
}

function walk(dir, found) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, found);
      continue;
    }
    if (entry.name === "llms-full.txt" || entry.name.startsWith("llms-full.txt.")) {
      found.push(full);
    }
  }
}

test("llms.txt is a curated English index", () => {
  const text = readLlms();
  const links = parseLinks(text);

  assert.match(text, /^# winstall\n/);
  assert.match(text, /^> .+/m);
  assert.equal(links.length, REQUIRED_LINKS.length);
  assert.deepEqual(
    links.map((link) => link.url),
    REQUIRED_LINKS,
  );

  for (const link of links) {
    assert.ok(link.description.trim().length > 0, `${link.url} needs a one-line description`);
    assert.equal(link.url.includes("?"), false);
    const pathname = new URL(link.url).pathname;
    assert.equal(/^\/apps\/.+/.test(pathname), false, link.url);
    assert.equal(/^\/packs\/.+/.test(pathname), false, link.url);
  }

  const generate = links.find((link) => link.url.endsWith("/generate"));
  assert.match(generate.description, /browser/i);
  assert.match(generate.description, /not the catalog/i);

  assert.match(text, /does not host or distribute installer binaries/i);
  assert.match(text, /not a package id/i);
  assert.match(text, /sitemap index/i);
  assert.doesNotMatch(text, /[\u3400-\u9fff]/);
  assert.doesNotMatch(text, /\d[\d,]*\+?\s+(apps|packages|packs)\b/i);
  assert.doesNotMatch(text, /\/my\/likes|\/my\b|\/api\/|\/users\//);
  assert.doesNotMatch(text, /nextauth|installer\/callback|WINSTALL_API|AuthKey|AuthSecret/i);

  const fullTextCopies = [];
  walk(root, fullTextCopies);
  assert.deepEqual(fullTextCopies, []);
});
