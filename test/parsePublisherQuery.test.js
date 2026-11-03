const test = require("node:test");
const assert = require("node:assert/strict");

test("parsePublisherQuery extracts publisher names", async () => {
  const { parsePublisherQuery, parseTagQuery } = await import("../utils/parsePublisherQuery.js");

  assert.equal(parsePublisherQuery("publisher: Mozilla"), "Mozilla");
  assert.equal(parsePublisherQuery("PUBLISHER:Microsoft Corporation"), "Microsoft Corporation");
  assert.equal(parsePublisherQuery("publisher:   Mozilla  "), "Mozilla");
  assert.equal(parsePublisherQuery("firefox"), null);
  assert.equal(parsePublisherQuery("tags: browser"), null);
  assert.equal(parsePublisherQuery("publisher:"), null);
  assert.equal(parsePublisherQuery(""), null);
  assert.equal(parsePublisherQuery(null), null);

  assert.equal(parseTagQuery("tags: browser"), "browser");
  assert.equal(parseTagQuery("TAGS: developer-tools"), "developer-tools");
  assert.equal(parseTagQuery("tags:   browser  "), "browser");
  assert.equal(parseTagQuery("firefox"), null);
  assert.equal(parseTagQuery("publisher: Mozilla"), null);
  assert.equal(parseTagQuery("tags:"), null);
  assert.equal(parseTagQuery(""), null);
  assert.equal(parseTagQuery(null), null);
});

test("parseAppsListQuery classifies list, publisher, and search prefixes", async () => {
  const { parseAppsListQuery } = await import("../utils/parsePublisherQuery.js");

  assert.deepEqual(parseAppsListQuery(""), { kind: "list" });
  assert.deepEqual(parseAppsListQuery("publisher: Mozilla"), {
    kind: "publisher",
    publisher: "Mozilla",
  });
  assert.deepEqual(parseAppsListQuery("firefox"), { kind: "search", q: "firefox" });
  assert.deepEqual(parseAppsListQuery("tags: browser"), {
    kind: "tag",
    tag: "browser",
  });
  assert.deepEqual(parseAppsListQuery("name: Code"), {
    kind: "search",
    q: "name: Code",
  });
  assert.deepEqual(parseAppsListQuery("desc: media"), {
    kind: "search",
    q: "desc: media",
  });
});

test("appsListPath builds paginated catalog, search, and publisher URLs", async () => {
  const { appsListPath, publishersListPath, tagListPath } = await import(
    "../utils/parsePublisherQuery.js"
  );

  assert.equal(appsListPath(""), "/apps?offset=0&limit=60");
  assert.equal(
    appsListPath("firefox", { offset: 60, limit: 60 }),
    "/apps/search?q=firefox&offset=60&limit=60"
  );
  assert.equal(
    appsListPath("tags: browser", { offset: 0, limit: 60 }),
    tagListPath("browser", { offset: 0, limit: 60 })
  );
  assert.equal(
    appsListPath("tags: browser", { offset: 0, limit: 60 }),
    "/apps/tags/browser?offset=0&limit=60"
  );
  assert.equal(
    appsListPath("name: Code", { offset: 0, limit: 60 }),
    "/apps/search?q=name%3A+Code&offset=0&limit=60"
  );
  assert.equal(
    appsListPath("publisher: Mozilla", { offset: 60, limit: 60 }),
    publishersListPath("Mozilla", { offset: 60, limit: 60 })
  );
});

test("appsPagePath encodes special characters in query strings", async () => {
  const { appsPagePath, publisherAppsPagePath, tagAppsPagePath } = await import(
    "../utils/parsePublisherQuery.js"
  );

  assert.equal(appsPagePath(""), "/apps");
  assert.equal(appsPagePath("firefox"), "/apps?q=firefox");
  assert.equal(
    appsPagePath("publisher: Notepad++ Team"),
    "/apps?q=publisher%3A+Notepad%2B%2B+Team"
  );
  assert.equal(appsPagePath("tags: c++"), "/apps?q=tags%3A+c%2B%2B");
  assert.equal(tagAppsPagePath("c++"), "/apps?q=tags%3A+c%2B%2B");
  assert.equal(
    publisherAppsPagePath("Notepad++ Team"),
    "/apps?q=publisher%3A+Notepad%2B%2B+Team"
  );

  const url = new URL(`http://localhost${publisherAppsPagePath("Notepad++ Team")}`);
  assert.equal(url.searchParams.get("q"), "publisher: Notepad++ Team");
});
