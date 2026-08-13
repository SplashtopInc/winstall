const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

function withEnv(overrides, fn) {
  const snapshot = {};
  for (const key of Object.keys(overrides)) {
    snapshot[key] = process.env[key];
    const value = overrides[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(snapshot)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });
}

test("signJwt signs payload with NEXTAUTH_SECRET and default 5m expiry", async () => {
  await withEnv({ NEXTAUTH_SECRET: "test-secret" }, async () => {
    const { signJwt } = await import("../utils/signJwt.js");
    const token = signJwt({ userId: "user-1", role: "admin" });

    assert.equal(typeof token, "string");
    const decoded = jwt.verify(token, "test-secret");
    assert.equal(decoded.userId, "user-1");
    assert.equal(decoded.role, "admin");
    assert.ok(typeof decoded.exp === "number");
    assert.ok(typeof decoded.iat === "number");
    assert.ok(decoded.exp - decoded.iat <= 300);
    assert.ok(decoded.exp - decoded.iat >= 299);
  });
});

test("signJwt returns null when NEXTAUTH_SECRET is missing", async () => {
  await withEnv({ NEXTAUTH_SECRET: undefined }, async () => {
    const { signJwt } = await import("../utils/signJwt.js");
    assert.equal(signJwt({ userId: "user-1" }), null);
  });
});

test("signJwt returns null for invalid payload", async () => {
  await withEnv({ NEXTAUTH_SECRET: "test-secret" }, async () => {
    const { signJwt } = await import("../utils/signJwt.js");
    assert.equal(signJwt(null), null);
    assert.equal(signJwt(undefined), null);
    assert.equal(signJwt("user-1"), null);
  });
});

test("signJwt accepts explicit secret and expiresIn", async () => {
  await withEnv({ NEXTAUTH_SECRET: "env-secret" }, async () => {
    const { signJwt } = await import("../utils/signJwt.js");
    const token = signJwt(
      { userId: "user-2" },
      { secret: "override-secret", expiresIn: "1h" }
    );

    assert.throws(() => jwt.verify(token, "env-secret"));
    const decoded = jwt.verify(token, "override-secret");
    assert.equal(decoded.userId, "user-2");
    assert.ok(decoded.exp - decoded.iat >= 3599);
    assert.ok(decoded.exp - decoded.iat <= 3600);
  });
});
