import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
      version: "1.0",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/packs/create",
    error: "/",
  },

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        // Preserve other fields from token if needed
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }

      return session;
    },

    jwt: async ({ token, account, profile }) => {
      if (profile) {
        // OAuth 1.0a fields (Twitter v1.1 API)
        token.id = profile.id_str ?? profile?.data?.id;
        if (profile.name) token.name = profile.name;
        if (profile.email) token.email = profile.email;
        if (profile.profile_image_url_https) token.picture = profile.profile_image_url_https;
      }

      if (account) {
        // Support both OAuth 1.0a and OAuth 2.0
        token.accessToken = account.oauth_token ?? account.access_token;
        token.refreshToken = account.oauth_token_secret ?? account.refresh_token;
      }

      return token;
    },
  },

  debug: process.env.NODE_ENV === "development",
});
