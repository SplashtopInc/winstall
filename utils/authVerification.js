import jwt from "jsonwebtoken";

/**
 * Checks whether an OAuth provider asserts email verification/domain ownership.
 *
 * @param {object} account NextAuth account object
 * @param {object} profile NextAuth raw OAuth profile object
 * @param {object} [options] Optional configuration / test injection
 * @param {typeof fetch} [options.fetchFn] Custom fetch implementation for testing
 * @returns {Promise<boolean>} True if provider asserts email verification
 */
export async function isProviderEmailVerified(account, profile, options = {}) {
  if (!account || !profile) {
    return false;
  }

  const email = (profile.email || "").toLowerCase().trim();
  if (!email) {
    return false;
  }

  switch (account.provider) {
    case "google": {
      return profile.email_verified === true;
    }

    case "azure-ad": {
      if (!account.id_token) {
        return false;
      }

      // NextAuth provides raw JWT string in account.id_token
      const decoded = jwt.decode(account.id_token);
      if (!decoded || typeof decoded !== "object") {
        return false;
      }

      // xms_edov indicates email domain ownership verified in multi-tenant Entra ID
      // email_verified is also supported for personal accounts (MSA)
      return decoded.xms_edov === true || decoded.email_verified === true;
    }

    case "github": {
      if (!account.access_token) {
        return false;
      }

      const fetchImpl = options.fetchFn || globalThis.fetch;
      if (typeof fetchImpl !== "function") {
        return false;
      }

      const res = await fetchImpl("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${account.access_token}`,
          "User-Agent": "winstall-auth",
        },
      });

      if (!res.ok) {
        return false;
      }

      const emails = await res.json();
      if (!Array.isArray(emails)) {
        return false;
      }

      return emails.some(
        (item) =>
          typeof item?.email === "string" &&
          item.email.toLowerCase().trim() === email &&
          item.verified === true
      );
    }

    case "twitter":
    default: {
      return false;
    }
  }
}
