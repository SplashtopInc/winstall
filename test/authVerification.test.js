import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { isProviderEmailVerified } from "../utils/authVerification.js";

test("isProviderEmailVerified - Google provider", async () => {
  const verified = await isProviderEmailVerified(
    { provider: "google" },
    { email: "alice@example.com", email_verified: true }
  );
  assert.equal(verified, true);

  const unverified = await isProviderEmailVerified(
    { provider: "google" },
    { email: "alice@example.com", email_verified: false }
  );
  assert.equal(unverified, false);
});

test("isProviderEmailVerified - Azure AD provider", async () => {
  const validTokenWithXms = jwt.sign(
    { email: "bob@contoso.com", xms_edov: true },
    "secret"
  );
  const verifiedXms = await isProviderEmailVerified(
    { provider: "azure-ad", id_token: validTokenWithXms },
    { email: "bob@contoso.com" }
  );
  assert.equal(verifiedXms, true);

  const validTokenWithVerified = jwt.sign(
    { email: "bob@contoso.com", email_verified: true },
    "secret"
  );
  const verifiedEmail = await isProviderEmailVerified(
    { provider: "azure-ad", id_token: validTokenWithVerified },
    { email: "bob@contoso.com" }
  );
  assert.equal(verifiedEmail, true);

  const invalidToken = jwt.sign(
    { email: "bob@contoso.com", xms_edov: false },
    "secret"
  );
  const unverified = await isProviderEmailVerified(
    { provider: "azure-ad", id_token: invalidToken },
    { email: "bob@contoso.com" }
  );
  assert.equal(unverified, false);

  const missingToken = await isProviderEmailVerified(
    { provider: "azure-ad" },
    { email: "bob@contoso.com" }
  );
  assert.equal(missingToken, false);
});

test("isProviderEmailVerified - GitHub provider", async () => {
  const mockFetchVerified = async () => ({
    ok: true,
    json: async () => [
      { email: "other@example.com", verified: true, primary: false },
      { email: "dev@example.com", verified: true, primary: true },
    ],
  });

  const verified = await isProviderEmailVerified(
    { provider: "github", access_token: "gho_test" },
    { email: "dev@example.com" },
    { fetchFn: mockFetchVerified }
  );
  assert.equal(verified, true);

  const mockFetchUnverified = async () => ({
    ok: true,
    json: async () => [
      { email: "victim@example.com", verified: false, primary: true },
    ],
  });

  const unverified = await isProviderEmailVerified(
    { provider: "github", access_token: "gho_test" },
    { email: "victim@example.com" },
    { fetchFn: mockFetchUnverified }
  );
  assert.equal(unverified, false);
});

test("isProviderEmailVerified - Twitter & unknown providers", async () => {
  const twitter = await isProviderEmailVerified(
    { provider: "twitter" },
    { email: "user@example.com" }
  );
  assert.equal(twitter, false);

  const unknown = await isProviderEmailVerified(
    { provider: "unknown" },
    { email: "user@example.com" }
  );
  assert.equal(unknown, false);
});
