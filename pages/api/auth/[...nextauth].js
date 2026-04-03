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

export default NextAuth({
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
      return session;
    },

    jwt: async ({ token, account, profile }) => {
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
});
