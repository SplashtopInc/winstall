const test = require("node:test");
const assert = require("node:assert/strict");

test("getSiteOrigin prioritizes WINSTALL_PUBLIC_URL over NEXTAUTH_URL", async () => {
  const origPublicUrl = process.env.WINSTALL_PUBLIC_URL;
  const origNextAuthUrl = process.env.NEXTAUTH_URL;

  try {
    process.env.WINSTALL_PUBLIC_URL = "https://custom.winstall.app/";
    process.env.NEXTAUTH_URL = "https://auth.winstall.app/";

    const { getSiteOrigin } = await import("../utils/helpers.js");
    assert.equal(getSiteOrigin(), "https://custom.winstall.app");
  } finally {
    if (origPublicUrl === undefined) {
      delete process.env.WINSTALL_PUBLIC_URL;
    } else {
      process.env.WINSTALL_PUBLIC_URL = origPublicUrl;
    }
    if (origNextAuthUrl === undefined) {
      delete process.env.NEXTAUTH_URL;
    } else {
      process.env.NEXTAUTH_URL = origNextAuthUrl;
    }
  }
});

test("getSiteOrigin falls back to NEXTAUTH_URL when WINSTALL_PUBLIC_URL is unset", async () => {
  const origPublicUrl = process.env.WINSTALL_PUBLIC_URL;
  const origNextAuthUrl = process.env.NEXTAUTH_URL;

  try {
    delete process.env.WINSTALL_PUBLIC_URL;
    process.env.NEXTAUTH_URL = "https://auth.winstall.app///";

    const { getSiteOrigin } = await import("../utils/helpers.js");
    assert.equal(getSiteOrigin(), "https://auth.winstall.app");
  } finally {
    if (origPublicUrl === undefined) {
      delete process.env.WINSTALL_PUBLIC_URL;
    } else {
      process.env.WINSTALL_PUBLIC_URL = origPublicUrl;
    }
    if (origNextAuthUrl === undefined) {
      delete process.env.NEXTAUTH_URL;
    } else {
      process.env.NEXTAUTH_URL = origNextAuthUrl;
    }
  }
});

test("getSiteOrigin returns empty string without localhost fallback when neither is set", async () => {
  const origPublicUrl = process.env.WINSTALL_PUBLIC_URL;
  const origNextAuthUrl = process.env.NEXTAUTH_URL;

  try {
    delete process.env.WINSTALL_PUBLIC_URL;
    delete process.env.NEXTAUTH_URL;

    const { getSiteOrigin } = await import("../utils/helpers.js");
    assert.equal(getSiteOrigin(), "");
  } finally {
    if (origPublicUrl === undefined) {
      delete process.env.WINSTALL_PUBLIC_URL;
    } else {
      process.env.WINSTALL_PUBLIC_URL = origPublicUrl;
    }
    if (origNextAuthUrl === undefined) {
      delete process.env.NEXTAUTH_URL;
    } else {
      process.env.NEXTAUTH_URL = origNextAuthUrl;
    }
  }
});
