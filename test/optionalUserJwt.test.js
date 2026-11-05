const test = require("node:test");
const assert = require("node:assert/strict");

test("POST /feedbacks is an optional user JWT write", async () => {
  const { isOptionalUserJwtRequest } = await import("../utils/optionalUserJwt.js");

  assert.equal(isOptionalUserJwtRequest("POST", "/feedbacks"), true);
  assert.equal(isOptionalUserJwtRequest("GET", "/feedbacks"), false);
  assert.equal(isOptionalUserJwtRequest("POST", "/packs"), false);
  assert.equal(isOptionalUserJwtRequest("POST", "/feedbacks/extra"), false);
});

test("optional JWT omits a missing or expired token", async () => {
  const { authorizationFromSession } = await import("../utils/optionalUserJwt.js");
  const now = Math.floor(Date.now() / 1000);

  assert.deepEqual(
    authorizationFromSession(
      { apiToken: "fresh-token", apiTokenExpires: now + 60 },
      { optional: true }
    ),
    { Authorization: "Bearer fresh-token" }
  );

  assert.deepEqual(
    authorizationFromSession(
      { apiToken: "stale-token", apiTokenExpires: now - 5 },
      { optional: true }
    ),
    {}
  );

  assert.deepEqual(
    authorizationFromSession({ apiTokenExpires: now + 60 }, { optional: true }),
    {}
  );

  assert.deepEqual(authorizationFromSession(null, { optional: true }), {});
});

test("required JWT still sends a stored token after expiry", async () => {
  const { authorizationFromSession } = await import("../utils/optionalUserJwt.js");
  const now = Math.floor(Date.now() / 1000);

  assert.deepEqual(
    authorizationFromSession(
      { apiToken: "stale-token", apiTokenExpires: now - 5 },
      { required: true }
    ),
    { Authorization: "Bearer stale-token" }
  );
});
