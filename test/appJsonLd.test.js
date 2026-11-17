const test = require("node:test");
const assert = require("node:assert/strict");

const FORBIDDEN_KEYS = ["offers", "aggregateRating", "review", "downloadUrl"];

async function loadBuilder() {
  return import("../utils/appJsonLd.js");
}

function withOrigin(publicUrl, iconBase, run) {
  const previousPublic = process.env.WINSTALL_PUBLIC_URL;
  const previousAuth = process.env.NEXTAUTH_URL;
  const previousIcon = process.env.WINSTALL_ICON_BASE;

  process.env.WINSTALL_PUBLIC_URL = publicUrl;
  delete process.env.NEXTAUTH_URL;
  if (iconBase === undefined) {
    delete process.env.WINSTALL_ICON_BASE;
  } else {
    process.env.WINSTALL_ICON_BASE = iconBase;
  }

  return Promise.resolve()
    .then(run)
    .finally(() => {
      restoreEnv("WINSTALL_PUBLIC_URL", previousPublic);
      restoreEnv("NEXTAUTH_URL", previousAuth);
      restoreEnv("WINSTALL_ICON_BASE", previousIcon);
    });
}

function restoreEnv(name, previous) {
  if (previous === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = previous;
  }
}

function assertNoForbiddenKeys(data) {
  for (const key of FORBIDDEN_KEYS) {
    assert.equal(Object.hasOwn(data, key), false);
  }
}

test("buildAppJsonLd writes core SoftwareApplication fields", async () => {
  await withOrigin("https://winstall.app/", undefined, async () => {
    const { buildAppJsonLd } = await loadBuilder();
    const data = buildAppJsonLd({
      _id: "VideoLAN.VLC",
      name: "VLC",
    });

    assert.deepEqual(data, {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "VLC",
      url: "https://winstall.app/apps/VideoLAN.VLC",
      operatingSystem: "Windows",
      identifier: "VideoLAN.VLC",
    });
    assertNoForbiddenKeys(data);
  });
});

test("buildAppJsonLd returns null without a name, id, or absolute origin", async () => {
  const { buildAppJsonLd } = await loadBuilder();

  await withOrigin("https://winstall.app", undefined, async () => {
    assert.equal(buildAppJsonLd(null), null);
    assert.equal(buildAppJsonLd({ _id: "VideoLAN.VLC", name: "  " }), null);
    assert.equal(buildAppJsonLd({ name: "VLC" }), null);
  });

  await withOrigin("", undefined, async () => {
    delete process.env.WINSTALL_PUBLIC_URL;
    delete process.env.NEXTAUTH_URL;
    assert.equal(
      buildAppJsonLd({ _id: "VideoLAN.VLC", name: "VLC" }),
      null
    );
  });
});

test("buildAppJsonLd includes present optional fields and omits empty ones", async () => {
  await withOrigin("https://winstall.app", undefined, async () => {
    const { buildAppJsonLd } = await loadBuilder();
    const data = buildAppJsonLd({
      _id: "VideoLAN.VLC",
      name: "VLC",
      latestVersion: "3.0.21",
      publisher: "VideoLAN",
      homepage: "",
      desc: "",
      fullDesc: "",
      minOS: "",
      license: "",
      licenseUrl: "",
      updatedAt: "",
      icon: "",
    });

    assert.equal(data.softwareVersion, "3.0.21");
    assert.deepEqual(data.author, { "@type": "Organization", name: "VideoLAN" });
    assert.deepEqual(data.publisher, { "@type": "Organization", name: "VideoLAN" });
    assert.equal(Object.hasOwn(data, "sameAs"), false);
    assert.equal(Object.hasOwn(data, "description"), false);
    assert.equal(Object.hasOwn(data, "image"), false);
    assertNoForbiddenKeys(data);
  });
});

test("buildAppJsonLd prefers full description, license URL, and strips tracking ref", async () => {
  await withOrigin("https://winstall.app", "https://icons.example", async () => {
    const { buildAppJsonLd } = await loadBuilder();
    const data = buildAppJsonLd({
      _id: "VideoLAN.VLC",
      name: "VLC",
      desc: "short",
      fullDesc: "full description",
      homepage: "https://www.videolan.org/?ref=winstall",
      license: "GPL-2.0",
      licenseUrl: "https://www.gnu.org/licenses/gpl-2.0.html",
      minOS: "10.0.0.0",
      updatedAt: "2026-01-02T00:00:00.000Z",
      icon: "vlc.png",
    });

    assert.equal(data.description, "full description");
    assert.equal(data.sameAs, "https://www.videolan.org/");
    assert.equal(data.license, "https://www.gnu.org/licenses/gpl-2.0.html");
    assert.equal(data.softwareRequirements, "10.0.0.0");
    assert.equal(data.dateModified, "2026-01-02T00:00:00.000Z");
    assert.equal(data.image, "https://icons.example/icons/next/vlc.webp");
  });
});

test("buildAppJsonLd maps the first mappable shelf and skips unmapped shelves", async () => {
  await withOrigin("https://winstall.app", undefined, async () => {
    const { buildAppJsonLd } = await loadBuilder();

    const mapped = buildAppJsonLd({
      _id: "Example.Dev",
      name: "Dev",
      categories: ["documents", "development", "game"],
    });
    assert.equal(mapped.applicationCategory, "DeveloperApplication");

    const unmapped = buildAppJsonLd({
      _id: "Example.Runtime",
      name: "Runtime",
      categories: ["runtimes"],
    });
    assert.equal(Object.hasOwn(unmapped, "applicationCategory"), false);
  });
});

test("serializeAppJsonLd escapes script-closing characters", async () => {
  const { buildAppJsonLd, serializeAppJsonLd } = await loadBuilder();

  await withOrigin("https://winstall.app", undefined, async () => {
    const data = buildAppJsonLd({
      _id: "Example.App",
      name: "App",
      fullDesc: "before </script><script>alert(1)</script> after",
    });
    const serialized = serializeAppJsonLd(data);

    assert.equal(serialized.includes("</script>"), false);
    assert.equal(serialized.includes("\\u003c/script>"), true);
    assert.equal(JSON.parse(serialized).description.includes("</script>"), true);
  });
});
