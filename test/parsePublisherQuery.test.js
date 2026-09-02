const test = require("node:test");
const assert = require("node:assert/strict");

test("parsePublisherQuery extracts publisher names", async () => {
  const { parsePublisherQuery } = await import("../utils/parsePublisherQuery.js");

  assert.equal(parsePublisherQuery("publisher: Mozilla"), "Mozilla");
  assert.equal(parsePublisherQuery("PUBLISHER:Microsoft Corporation"), "Microsoft Corporation");
  assert.equal(parsePublisherQuery("publisher:   Mozilla  "), "Mozilla");
  assert.equal(parsePublisherQuery("firefox"), null);
  assert.equal(parsePublisherQuery("tags: browser"), null);
  assert.equal(parsePublisherQuery("publisher:"), null);
  assert.equal(parsePublisherQuery(""), null);
  assert.equal(parsePublisherQuery(null), null);
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
    kind: "search",
    q: "browser",
    field: "tags",
  });
  assert.deepEqual(parseAppsListQuery("name: Code"), {
    kind: "search",
    q: "Code",
    field: "name",
  });
  assert.deepEqual(parseAppsListQuery("desc: media"), {
    kind: "search",
    q: "media",
    field: "desc",
  });
});

test("appsListPath builds paginated catalog, search, and publisher URLs", async () => {
  const { appsListPath, publishersListPath } = await import(
    "../utils/parsePublisherQuery.js"
  );

  assert.equal(appsListPath(""), "/apps?offset=0&limit=60");
  assert.equal(
    appsListPath("firefox", { offset: 60, limit: 60 }),
    "/apps/search?q=firefox&offset=60&limit=60"
  );
  assert.equal(
    appsListPath("tags: browser", { offset: 0, limit: 60 }),
    "/apps/search?q=browser&tags=browser&offset=0&limit=60"
  );
  assert.equal(
    appsListPath("publisher: Mozilla", { offset: 60, limit: 60 }),
    publishersListPath("Mozilla", { offset: 60, limit: 60 })
  );
});

test("appsPagePath encodes special characters in query strings", async () => {
  const { appsPagePath, publisherAppsPagePath } = await import(
    "../utils/parsePublisherQuery.js"
  );

  assert.equal(appsPagePath(""), "/apps");
  assert.equal(appsPagePath("firefox"), "/apps?q=firefox");
  assert.equal(
    appsPagePath("publisher: Notepad++ Team"),
    "/apps?q=publisher%3A+Notepad%2B%2B+Team"
  );
  assert.equal(appsPagePath("tags: c++", { page: 2 }), "/apps?q=tags%3A+c%2B%2B&page=2");
  assert.equal(
    publisherAppsPagePath("Notepad++ Team"),
    "/apps?q=publisher%3A+Notepad%2B%2B+Team"
  );

  const url = new URL(`http://localhost${publisherAppsPagePath("Notepad++ Team")}`);
  assert.equal(url.searchParams.get("q"), "publisher: Notepad++ Team");
});
