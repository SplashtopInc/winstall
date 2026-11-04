import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

/**
 * Replicates the signIn callback logic in NextAuth options for unit testing
 */
async function executeSignInCallback({
  user,
  account,
  profile,
  adapter,
  isProviderEmailVerifiedFn,
}) {
  if (!account) return true;

  if (account.providerAccountId && account.provider) {
    const existingAccountUser = await adapter.getUserByAccount({
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    });
    if (existingAccountUser) {
      return true;
    }
  }

  const targetEmail = (profile?.email || user?.email || "").toLowerCase().trim();

  if (targetEmail) {
    const existingUserByEmail = await adapter.getUserByEmail(targetEmail);
    if (existingUserByEmail) {
      const verified = await isProviderEmailVerifiedFn(account, profile);
      if (!verified) {
        return false;
      }
    }
  }

  return true;
}

test("signIn callback - previously linked account bypasses merge check", async () => {
  const mockAdapter = {
    getUserByAccount: async () => ({ id: "u1", publicId: "existing_user" }),
    getUserByEmail: async () => ({ id: "u1", publicId: "existing_user" }),
  };

  const allowed = await executeSignInCallback({
    account: { provider: "azure-ad", providerAccountId: "azure-sub-123" },
    profile: { email: "victim@example.com" },
    adapter: mockAdapter,
    isProviderEmailVerifiedFn: async () => false, // Even if unverified claim, already linked
  });

  assert.equal(allowed, true);
});

test("signIn callback - foreign tenant Azure AD user attempting unverified linking is rejected", async () => {
  const mockAdapter = {
    getUserByAccount: async () => null,
    getUserByEmail: async () => ({ id: "u1", publicId: "victim_public_id" }),
  };

  const fakeIdToken = jwt.sign(
    { email: "victim@example.com", xms_edov: false },
    "secret"
  );

  const { isProviderEmailVerified } = await import(
    "../utils/authVerification.js"
  );

  const allowed = await executeSignInCallback({
    account: {
      provider: "azure-ad",
      providerAccountId: "foreign-sub-999",
      id_token: fakeIdToken,
    },
    profile: { email: "victim@example.com" },
    adapter: mockAdapter,
    isProviderEmailVerifiedFn: isProviderEmailVerified,
  });

  assert.equal(allowed, false);
});

test("signIn callback - verified Azure AD with xms_edov is allowed to link", async () => {
  const mockAdapter = {
    getUserByAccount: async () => null,
    getUserByEmail: async () => ({ id: "u1", publicId: "legit_user" }),
  };

  const validIdToken = jwt.sign(
    { email: "bob@contoso.com", xms_edov: true },
    "secret"
  );

  const { isProviderEmailVerified } = await import(
    "../utils/authVerification.js"
  );

  const allowed = await executeSignInCallback({
    account: {
      provider: "azure-ad",
      providerAccountId: "contoso-sub-111",
      id_token: validIdToken,
    },
    profile: { email: "bob@contoso.com" },
    adapter: mockAdapter,
    isProviderEmailVerifiedFn: isProviderEmailVerified,
  });

  assert.equal(allowed, true);
});

test("signIn callback - verified Google is allowed to link", async () => {
  const mockAdapter = {
    getUserByAccount: async () => null,
    getUserByEmail: async () => ({ id: "u1", publicId: "alice_user" }),
  };

  const { isProviderEmailVerified } = await import(
    "../utils/authVerification.js"
  );

  const allowed = await executeSignInCallback({
    account: { provider: "google", providerAccountId: "google-123" },
    profile: { email: "alice@example.com", email_verified: true },
    adapter: mockAdapter,
    isProviderEmailVerifiedFn: isProviderEmailVerified,
  });

  assert.equal(allowed, true);
});

test("signIn callback - unverified Google is rejected", async () => {
  const mockAdapter = {
    getUserByAccount: async () => null,
    getUserByEmail: async () => ({ id: "u1", publicId: "alice_user" }),
  };

  const { isProviderEmailVerified } = await import(
    "../utils/authVerification.js"
  );

  const allowed = await executeSignInCallback({
    account: { provider: "google", providerAccountId: "google-123" },
    profile: { email: "alice@example.com", email_verified: false },
    adapter: mockAdapter,
    isProviderEmailVerifiedFn: isProviderEmailVerified,
  });

  assert.equal(allowed, false);
});

test("signIn callback - new user with non-existing email is allowed", async () => {
  const mockAdapter = {
    getUserByAccount: async () => null,
    getUserByEmail: async () => null,
  };

  const { isProviderEmailVerified } = await import(
    "../utils/authVerification.js"
  );

  const allowed = await executeSignInCallback({
    account: { provider: "twitter", providerAccountId: "twitter-new" },
    profile: { email: "newuser@example.com" },
    adapter: mockAdapter,
    isProviderEmailVerifiedFn: isProviderEmailVerified,
  });

  assert.equal(allowed, true);
});
