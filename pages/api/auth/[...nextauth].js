// Configure proxy before importing next-auth
import "../../../utils/proxyConfig";

import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import tunnel from "tunnel";
import clientPromise from "../../../lib/mongodb";

const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

let httpOptions = { timeout: 10000 };

if (proxyUrl) {
  const proxyUrlObj = new URL(proxyUrl);

  const tunnelingAgent = tunnel.httpsOverHttp({
    proxy: {
      host: proxyUrlObj.hostname,
      port: parseInt(proxyUrlObj.port) || 3128,
    },
  });

  httpOptions.agent = tunnelingAgent;
}

/** Provider-specific id — used as pack creator id across the app */
function getOAuthUserId(account, profile) {
  if (!account) return null;

  if (account.provider === "twitter") {
    const id = profile?.data?.id ?? profile?.id;
    if (id != null) return String(id);
  }

  if (account.provider === "google" || account.provider === "azure-ad") {
    const id = profile?.sub ?? profile?.id;
    if (id != null) return String(id);
  }

  if (account.provider === "github") {
    const id = profile?.id ?? profile?.sub;
    if (id != null) return String(id);
  }

  if (account.providerAccountId != null) {
    return String(account.providerAccountId);
  }

  return null;
}

function applyProfileToToken(token, account, profile) {
  if (!profile) return token;

  if (account?.provider === "twitter") {
    if (profile.data?.name) token.name = profile.data.name;
    if (profile.data?.username) token.username = profile.data.username;
    if (profile.data?.profile_image_url) {
      token.picture = profile.data.profile_image_url;
    }
  }

  if (account?.provider === "google" || account?.provider === "azure-ad") {
    if (profile.name) token.name = profile.name;
    if (profile.email) token.email = profile.email;
    if (profile.picture) token.picture = profile.picture;
    if (profile.email) {
      token.username = profile.email.split("@")[0];
    }
  }

  if (account?.provider === "github") {
    if (profile.name) token.name = profile.name;
    if (profile.email) token.email = profile.email;
    if (profile.image) token.picture = profile.image;
    if (profile.login) token.username = profile.login;
  }

  return token;
}

const providers = [];

if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
      httpOptions,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      httpOptions,
    })
  );
}

const azureClientId =
  process.env.AZURE_AD_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID;
const azureClientSecret =
  process.env.AZURE_AD_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET;
const azureTenantId =
  process.env.AZURE_AD_TENANT_ID ||
  process.env.MICROSOFT_TENANT_ID ||
  "common";

if (azureClientId && azureClientSecret) {
  providers.push(
    AzureADProvider({
      clientId: azureClientId,
      clientSecret: azureClientSecret,
      httpOptions,
      tenantId: azureTenantId,
    })
  );
}

if (providers.length === 0) {
  console.warn(
    "[NextAuth] No OAuth providers configured. Set TWITTER_*, GOOGLE_*, GITHUB_*, and/or AZURE_AD_* (Microsoft) env vars."
  );
}

// Export the auth options for use in getServerSession
export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers,

  secret: process.env.NEXTAUTH_SECRET,

  // JWT sessions: adapter still persists users/accounts in MongoDB
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/packs?tab=mine",
    error: "/packs?tab=mine",
  },

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.dbId = token.dbUserId;
        session.user.provider = token.provider;
        session.user.username = token.username;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }

      // Development mode: log session structure for testing/comparison
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('\n[NextAuth Session Debug]');
      //   console.log('Provider: Twitter OAuth 2.0');
      //   console.log('Session:', JSON.stringify(session, null, 2));
      //   console.log('Token (JWT):', JSON.stringify({
      //     id: token.id,
      //     name: token.name,
      //     email: token.email,
      //     picture: token.picture,
      //     username: token.username,
      //     iat: token.iat,
      //     exp: token.exp,
      //     jti: token.jti
      //   }, null, 2));
      //   console.log('[NextAuth Session Debug End]\n');
      // }

      return session;
    },

    jwt: async ({ token, user, account, profile }) => {
      if (process.env.NODE_ENV === "development" && profile) {
        console.log("\n[NextAuth JWT Debug - Raw Profile]");
        console.log(`Provider: ${account?.provider ?? "unknown"}`);
        console.log("Profile:", JSON.stringify(profile, null, 2));
        if (account) {
          console.log(
            "Account:",
            JSON.stringify(
              {
                provider: account.provider,
                type: account.type,
                providerAccountId: account.providerAccountId,
              },
              null,
              2
            )
          );
        }
        console.log("[NextAuth JWT Debug End]\n");
      }

      const oauthUserId = getOAuthUserId(account, profile);
      if (oauthUserId) {
        token.id = oauthUserId;
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      if (user?.id) {
        token.dbUserId = user.id;
      }

      applyProfileToToken(token, account, profile);

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
  },

  events: {
    signIn: async ({ user, account, profile, isNewUser }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[NextAuth] signIn", {
          dbUserId: user?.id,
          oauthUserId: getOAuthUserId(account, profile),
          isNewUser,
          provider: account?.provider,
        });
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
