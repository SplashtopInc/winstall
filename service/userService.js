import { ObjectId } from "mongodb";

import clientPromise from "../lib/mongodb";
import { deleteUserPacksViaApi } from "../utils/packApiServer";

export class UserError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function toObjectId(id) {
  if (!id) return null;

  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

async function deleteNextAuthUser(dbUserId) {
  const objectId = toObjectId(dbUserId);
  if (!objectId) return;

  const client = await clientPromise;
  const db = client.db();

  await db.collection("accounts").deleteMany({ userId: objectId });
  await db.collection("sessions").deleteMany({ userId: objectId });
  await db.collection("users").deleteOne({ _id: objectId });
}

export async function deleteUserAccount(userId, dbUserId) {
  if (!userId) {
    throw new UserError("Authentication required", 401);
  }

  try {
    await deleteUserPacksViaApi(userId);
  } catch (err) {
    console.error("[deleteUserAccount] API pack cascade failed:", err);
    throw new UserError(
      err.message || "Failed to delete packs from API",
      500
    );
  }

  if (dbUserId) {
    await deleteNextAuthUser(dbUserId);
  }

  return { msg: "Account deleted." };
}
