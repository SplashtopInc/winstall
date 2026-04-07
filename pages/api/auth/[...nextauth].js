// Configure proxy before importing next-auth
import "../../../utils/proxyConfig";

import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import tunnel from "tunnel";

const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

let httpOptions = { timeout: 10000 };

if (proxyUrl) {
  const proxyUrlObj = new URL(proxyUrl);

  const tunnelingAgent = tunnel.httpsOverHttp({
    proxy: {
      host: proxyUrlObj.hostname,
      port: parseInt(proxyUrlObj.port) || 3128,
    }
  });

  httpOptions.agent = tunnelingAgent;
}

// Export the auth options for use in getServerSession
export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
      httpOptions,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/packs/create",
    error: "/packs/create",
  },

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }

      // Development mode: log session structure for testing/comparison
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[NextAuth Session Debug]');
        console.log('Provider: Twitter OAuth 2.0');
        console.log('Session:', JSON.stringify(session, null, 2));
        console.log('Token (JWT):', JSON.stringify({
          id: token.id,
          name: token.name,
          email: token.email,
          picture: token.picture,
          username: token.username,
          iat: token.iat,
          exp: token.exp,
          jti: token.jti
        }, null, 2));
        console.log('[NextAuth Session Debug End]\n');
      }

      return session;
    },

    jwt: async ({ token, account, profile }) => {
      // Development mode: log raw profile from OAuth provider
      if (process.env.NODE_ENV === 'development' && profile) {
        console.log('\n[NextAuth JWT Debug - Raw Profile]');
        console.log('Provider: Twitter OAuth 2.0');
        console.log('Profile:', JSON.stringify(profile, null, 2));
        if (account) {
          console.log('Account:', JSON.stringify({
            provider: account.provider,
            type: account.type,
            access_token: account.access_token ? '***' + account.access_token.slice(-8) : undefined,
            refresh_token: account.refresh_token ? '***' + account.refresh_token.slice(-8) : undefined,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope
          }, null, 2));
        }
        console.log('[NextAuth JWT Debug End]\n');
      }

      if (profile) {
        token.id = profile.data?.id ?? profile.id;
        if (profile.data?.name) token.name = profile.data.name;
        if (profile.data?.username) token.username = profile.data.username;
        if (profile.data?.profile_image_url) token.picture = profile.data.profile_image_url;
      }

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
