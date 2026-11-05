const test = require("node:test");
const assert = require("node:assert/strict");

test("meta content trims PACK_TRENDING_OWNER_USER_ID", async () => {
  const { packTrendingOwnerMetaContent } = await import(
    "../utils/packTrendingOwner.js"
  );
  const previous = process.env.PACK_TRENDING_OWNER_USER_ID;
  process.env.PACK_TRENDING_OWNER_USER_ID = "  ops-user  ";

  try {
    assert.equal(packTrendingOwnerMetaContent(), "ops-user");
  } finally {
    if (previous === undefined) {
      delete process.env.PACK_TRENDING_OWNER_USER_ID;
    } else {
      process.env.PACK_TRENDING_OWNER_USER_ID = previous;
    }
  }
});

test("unset or blank env yields an empty ops id", async () => {
  const { packTrendingOwnerMetaContent } = await import(
    "../utils/packTrendingOwner.js"
  );
  const previous = process.env.PACK_TRENDING_OWNER_USER_ID;

  try {
    delete process.env.PACK_TRENDING_OWNER_USER_ID;
    assert.equal(packTrendingOwnerMetaContent(), "");

    process.env.PACK_TRENDING_OWNER_USER_ID = "   ";
    assert.equal(packTrendingOwnerMetaContent(), "");
  } finally {
    if (previous === undefined) {
      delete process.env.PACK_TRENDING_OWNER_USER_ID;
    } else {
      process.env.PACK_TRENDING_OWNER_USER_ID = previous;
    }
  }
});

test("browser reads winstall-pack-trending-owner and ignores a missing tag", async () => {
  const { readPackTrendingOwnerUserId } = await import(
    "../utils/packTrendingOwner.js"
  );
  const previous = process.env.PACK_TRENDING_OWNER_USER_ID;
  process.env.PACK_TRENDING_OWNER_USER_ID = "from-env";
  global.window = {};

  try {
    global.document = {
      querySelector() {
        return null;
      },
    };
    assert.equal(readPackTrendingOwnerUserId(), "");

    global.document = {
      querySelector(selector) {
        if (selector === 'meta[name="winstall-pack-trending-owner"]') {
          return { getAttribute: () => "   " };
        }
        return null;
      },
    };
    assert.equal(readPackTrendingOwnerUserId(), "");

    global.document = {
      querySelector(selector) {
        if (selector === 'meta[name="winstall-pack-trending-owner"]') {
          return { getAttribute: () => "  ops-user  " };
        }
        return null;
      },
    };
    assert.equal(readPackTrendingOwnerUserId(), "ops-user");
  } finally {
    delete global.window;
    delete global.document;
    if (previous === undefined) {
      delete process.env.PACK_TRENDING_OWNER_USER_ID;
    } else {
      process.env.PACK_TRENDING_OWNER_USER_ID = previous;
    }
  }
});
