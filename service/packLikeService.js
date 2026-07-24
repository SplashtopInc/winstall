import Pack from "../dbModel/Pack";
import PackLike from "../dbModel/PackLike";
import { canViewPack } from "./packService";

export class PackLikeError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function canLikePack(pack, userId) {
  return !!userId && canViewPack(pack, userId);
}

async function findActivePack(packId) {
  return Pack.findOne({ _id: packId, status: "active" }).lean().exec();
}

export async function likePack(packId, userId) {
  const pack = await findActivePack(packId);
  if (!pack) {
    throw new PackLikeError("Pack not found.", 404);
  }

  if (!canLikePack(pack, userId)) {
    throw new PackLikeError("Could not like pack.", 403);
  }

  try {
    await PackLike.create({ userId, packId });
  } catch (err) {
    if (err.code === 11000) {
      throw new PackLikeError("Already liked.", 409);
    }
    throw err;
  }

  const updated = await Pack.findByIdAndUpdate(
    packId,
    { $inc: { "stats.likeCount": 1 } },
    { returnDocument: "after", timestamps: false }
  )
    .lean()
    .exec();

  return {
    likeCount: updated?.stats?.likeCount ?? 0,
    liked: true,
  };
}

export async function unlikePack(packId, userId) {
  const pack = await findActivePack(packId);
  if (!pack) {
    throw new PackLikeError("Pack not found.", 404);
  }

  const deleted = await PackLike.findOneAndDelete({ userId, packId }).exec();
  if (!deleted) {
    throw new PackLikeError("Like not found.", 404);
  }

  await Pack.findOneAndUpdate(
    { _id: packId, "stats.likeCount": { $gt: 0 } },
    { $inc: { "stats.likeCount": -1 } },
    { timestamps: false }
  ).exec();

  const updated = await Pack.findById(packId).lean().exec();

  return {
    likeCount: updated?.stats?.likeCount ?? 0,
    liked: false,
  };
}

export async function isPackLikedByUser(packId, userId) {
  if (!userId) return false;

  const doc = await PackLike.findOne({ userId, packId }).lean().exec();
  return !!doc;
}

export async function deleteLikesForPack(packId) {
  await PackLike.deleteMany({ packId });
}
