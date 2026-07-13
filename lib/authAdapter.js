import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { nanoid } from "nanoid";

let indexesEnsured = false;

async function ensureUserIndexes(clientPromise) {
  if (indexesEnsured) return;

  const client = await clientPromise;
  await client
    .db()
    .collection("users")
    .createIndex({ publicId: 1 }, { unique: true, sparse: true });

  indexesEnsured = true;
}

async function assignPublicId(base, user) {
  if (!user) return null;
  if (user.publicId) return user;

  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await base.updateUser({ id: user.id, publicId: nanoid() });
    } catch (err) {
      if (err?.code === 11000 && attempt < MAX_ATTEMPTS - 1) continue;
      throw err;
    }
  }

  return user;
}

/**
 * NextAuth MongoDB adapter with a stable business user id (`publicId`, nanoid).
 * `users._id` stays ObjectId for NextAuth; `publicId` is exposed as session.user.id.
 */
export function createAuthAdapter(clientPromise) {
  const base = MongoDBAdapter(clientPromise);

  return {
    ...base,

    async createUser(data) {
      await ensureUserIndexes(clientPromise);

      const MAX_ATTEMPTS = 3;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          return await base.createUser({ ...data, publicId: nanoid() });
        } catch (err) {
          if (err?.code === 11000 && attempt < MAX_ATTEMPTS - 1) continue;
          throw err;
        }
      }

      throw new Error("Failed to create user with unique publicId");
    },

    async getUser(id) {
      const user = await base.getUser(id);
      return assignPublicId(base, user);
    },

    async getUserByEmail(email) {
      const user = await base.getUserByEmail(email);
      return assignPublicId(base, user);
    },

    async getUserByAccount(providerAccountId) {
      const user = await base.getUserByAccount(providerAccountId);
      return assignPublicId(base, user);
    },
  };
}
