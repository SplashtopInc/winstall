import { ObjectId } from "mongodb";

import clientPromise from "../lib/mongodb";
import { connectMongoose } from "../lib/mongoose";
import Pack from "../dbModel/Pack";
import PackLike from "../dbModel/PackLike";
import { isPackApiViaWinstall } from "../utils/packApiConfig";
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

async function deleteLocalUserPacks(userId) {
  await connectMongoose();

  const ownedPacks = await Pack.find({ userId, status: "active" })
    .select("_id")
    .lean()
    .exec();
  const ownedPackIds = ownedPacks.map((pack) => pack._id);

  if (ownedPackIds.length > 0) {
    await PackLike.deleteMany({ packId: { $in: ownedPackIds } }).exec();
  }

  await Pack.deleteMany({ userId }).exec();
  await PackLike.deleteMany({ userId }).exec();
}

export async function deleteUserAccount(userId, dbUserId) {
  if (!userId) {
    throw new UserError("Authentication required", 401);
  }

  if (isPackApiViaWinstall()) {
    try {
      await deleteUserPacksViaApi(userId);
    } catch (err) {
      console.error("[deleteUserAccount] API pack cascade failed:", err);
      throw new UserError(
        err.message || "Failed to delete packs from API",
        500
      );
    }
    // Clear any leftover local Pack rows (same-DB test / pre-cutover residue)
    try {
      await deleteLocalUserPacks(userId);
    } catch (err) {
      console.warn(
        "[deleteUserAccount] Local pack cleanup after API cascade:",
        err.message
      );
    }
  } else {
    await deleteLocalUserPacks(userId);
  }

  if (dbUserId) {
    await deleteNextAuthUser(dbUserId);
  }

  return { msg: "Account deleted." };
}
