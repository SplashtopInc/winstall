const test = require("node:test");
const assert = require("node:assert/strict");

test("downloadInstantInstaller triggers direct download when response is JSON with downloadUrl", async (t) => {
  const origFetch = global.fetch;
  const origDocument = global.document;

  let downloadedUrl = null;
  let clicked = false;

  global.document = {
    createElement: () => ({
      set href(val) { downloadedUrl = val; },
      set download(val) {},
      click: () => { clicked = true; },
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };

  global.fetch = async (url) => {
    assert.equal(url, "/api/installer");
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        downloadUrl: "https://s3.example.com/installers/hash123.exe?signed",
        cached: true,
      }),
    };
  };

  t.after(() => {
    global.fetch = origFetch;
    global.document = origDocument;
  });

  const { downloadInstantInstaller } = await import("../utils/downloadInstantInstaller.js");
  await downloadInstantInstaller([{ _id: "Test.App", name: "Test App" }]);

  assert.equal(downloadedUrl, "https://s3.example.com/installers/hash123.exe?signed");
  assert.equal(clicked, true);
});

test("downloadInstantInstaller triggers polling when response is JSON with statusUrl", async (t) => {
  const origFetch = global.fetch;
  const origDocument = global.document;

  let pollCount = 0;
  let downloadedUrl = null;

  global.document = {
    createElement: () => ({
      set href(val) { downloadedUrl = val; },
      set download(val) {},
      click: () => {},
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };

  global.fetch = async (url) => {
    if (url === "/api/installer") {
      return {
        ok: true,
        status: 202,
        headers: {
          get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
        },
        json: async () => ({
          statusUrl: "/api/installer/status?taskId=test-poll-task",
        }),
      };
    }

    if (url === "/api/installer/status?taskId=test-poll-task") {
      pollCount += 1;
      return {
        status: 200,
        json: async () => ({
          downloadUrl: "https://s3.example.com/installers/polled.exe?signed",
        }),
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  };

  t.after(() => {
    global.fetch = origFetch;
    global.document = origDocument;
  });

  const { downloadInstantInstaller } = await import("../utils/downloadInstantInstaller.js");
  await downloadInstantInstaller([{ _id: "Test.App", name: "Test App" }]);

  assert.equal(pollCount, 1);
  assert.equal(downloadedUrl, "https://s3.example.com/installers/polled.exe?signed");
});

test("downloadInstantInstaller handles octet-stream binary directly", async (t) => {
  const origFetch = global.fetch;
  const origDocument = global.document;
  const origWindow = global.window;

  let objectUrlCreated = false;
  let revokedUrl = null;

  global.window = {
    URL: {
      createObjectURL: () => {
        objectUrlCreated = true;
        return "blob:http://localhost/test-blob-url";
      },
      revokeObjectURL: (val) => {
        revokedUrl = val;
      },
    },
  };

  global.document = {
    createElement: () => ({
      set href(val) {},
      set download(val) {},
      click: () => {},
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };

  global.fetch = async () => ({
    ok: true,
    status: 200,
    headers: {
      get: (h) => (h.toLowerCase() === "content-type" ? "application/octet-stream" : null),
    },
    blob: async () => ({ size: 512 }),
  });

  t.after(() => {
    global.fetch = origFetch;
    global.document = origDocument;
    global.window = origWindow;
  });

  const { downloadInstantInstaller } = await import("../utils/downloadInstantInstaller.js");
  await downloadInstantInstaller([{ _id: "Test.App", name: "Test App" }]);

  assert.equal(objectUrlCreated, true);
  assert.equal(revokedUrl, "blob:http://localhost/test-blob-url");
});

test("downloadInstantInstaller throws descriptive error on non-ok response", async (t) => {
  const origFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ error: "Server crashed while building" }),
  });

  t.after(() => {
    global.fetch = origFetch;
  });

  const { downloadInstantInstaller } = await import("../utils/downloadInstantInstaller.js");

  await assert.rejects(
    async () => {
      await downloadInstantInstaller([{ _id: "Test.App", name: "Test App" }]);
    },
    { message: "Server crashed while building" }
  );
});
