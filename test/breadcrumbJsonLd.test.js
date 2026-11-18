const test = require("node:test");
const assert = require("node:assert/strict");

async function loadBuilder() {
  return import("../utils/breadcrumbJsonLd.js");
}

function withOrigin(publicUrl, run) {
  const previousPublic = process.env.WINSTALL_PUBLIC_URL;
  const previousAuth = process.env.NEXTAUTH_URL;

  process.env.WINSTALL_PUBLIC_URL = publicUrl;
  delete process.env.NEXTAUTH_URL;

  return Promise.resolve()
    .then(run)
    .finally(() => {
      restoreEnv("WINSTALL_PUBLIC_URL", previousPublic);
      restoreEnv("NEXTAUTH_URL", previousAuth);
    });
}

function restoreEnv(name, previous) {
  if (previous === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = previous;
  }
}

function names(data) {
  return data.itemListElement.map((item) => item.name);
}

function items(data) {
  return data.itemListElement.map((item) => item.item);
}

test("category all is a two-level Apps trail", async () => {
  await withOrigin("https://winstall.app/", async () => {
    const { buildCategoryBreadcrumbJsonLd } = await loadBuilder();
    const data = buildCategoryBreadcrumbJsonLd("all");

    assert.equal(data["@type"], "BreadcrumbList");
    assert.deepEqual(names(data), ["winstall", "Apps"]);
    assert.deepEqual(items(data), [
      "https://winstall.app/",
      "https://winstall.app/category",
    ]);
    assert.deepEqual(
      data.itemListElement.map((item) => item.position),
      [1, 2]
    );
  });
});

test("shelf category adds the shelf label", async () => {
  await withOrigin("https://winstall.app", async () => {
    const { buildCategoryBreadcrumbJsonLd } = await loadBuilder();
    const data = buildCategoryBreadcrumbJsonLd("development");

    assert.deepEqual(names(data), ["winstall", "Apps", "Developer Tools"]);
    assert.equal(
      items(data)[2],
      "https://winstall.app/category/development"
    );
  });
});

test("app detail is a four-level trail through the first shelf", async () => {
  await withOrigin("https://winstall.app", async () => {
    const { buildAppBreadcrumbJsonLd } = await loadBuilder();
    const data = buildAppBreadcrumbJsonLd({
      _id: "VideoLAN.VLC",
      name: "VLC",
      categories: ["browser"],
    });

    assert.deepEqual(names(data), ["winstall", "Apps", "Browsers", "VLC"]);
    assert.deepEqual(items(data).slice(2), [
      "https://winstall.app/category/browser",
      "https://winstall.app/apps/VideoLAN.VLC",
    ]);
    assert.equal(items(data)[1].endsWith("/apps"), false);
  });
});

test("multiple shelves keep only the first in shelf order", async () => {
  await withOrigin("https://winstall.app", async () => {
    const { buildAppBreadcrumbJsonLd } = await loadBuilder();
    const data = buildAppBreadcrumbJsonLd({
      _id: "Example.App",
      name: "Example",
      categories: ["documents", "development", "game"],
    });

    assert.deepEqual(names(data), [
      "winstall",
      "Apps",
      "Developer Tools",
      "Example",
    ]);
    assert.equal(data.itemListElement.length, 4);
  });
});

test("an app with no known shelf returns null", async () => {
  await withOrigin("https://winstall.app", async () => {
    const { buildAppBreadcrumbJsonLd } = await loadBuilder();
    assert.equal(
      buildAppBreadcrumbJsonLd({
        _id: "Example.App",
        name: "Example",
        categories: ["not-a-shelf"],
      }),
      null
    );
    assert.equal(
      buildAppBreadcrumbJsonLd({ _id: "Example.App", name: "Example" }),
      null
    );
  });
});

test("pack list and loaded pack detail", async () => {
  await withOrigin("https://winstall.app", async () => {
    const { buildPackListBreadcrumbJsonLd, buildPackDetailBreadcrumbJsonLd } =
      await loadBuilder();

    const list = buildPackListBreadcrumbJsonLd();
    assert.deepEqual(names(list), ["winstall", "Packs"]);
    assert.deepEqual(items(list), [
      "https://winstall.app/",
      "https://winstall.app/packs",
    ]);

    const detail = buildPackDetailBreadcrumbJsonLd({
      _id: "pack-1",
      name: "Dev Essentials",
    });
    assert.deepEqual(names(detail), ["winstall", "Packs", "Dev Essentials"]);
    assert.equal(items(detail)[2], "https://winstall.app/packs/pack-1");
    assert.equal(buildPackDetailBreadcrumbJsonLd({ _id: "pack-1", name: "  " }), null);
  });
});

test("serialization escapes < so a name cannot close the script", async () => {
  await withOrigin("https://winstall.app", async () => {
    const { buildPackDetailBreadcrumbJsonLd, serializeBreadcrumbJsonLd } =
      await loadBuilder();
    const data = buildPackDetailBreadcrumbJsonLd({
      _id: "pack-1",
      name: "A </script> B",
    });
    const json = serializeBreadcrumbJsonLd(data);

    assert.equal(json.includes("</script>"), false);
    assert.match(json, /\\u003c\/script>/);
  });
});

test("missing origin returns null", async () => {
  await withOrigin("", async () => {
    delete process.env.WINSTALL_PUBLIC_URL;
    delete process.env.NEXTAUTH_URL;
    const { buildPackListBreadcrumbJsonLd } = await loadBuilder();
    assert.equal(buildPackListBreadcrumbJsonLd(), null);
  });
});
