import Pack from "../dbModel/Pack";
import PackLike from "../dbModel/PackLike";
import { VISIBILITY } from "../dbModel/Pack";
import {
  hasInstallOptions,
  normalizeInstallOptions,
} from "../utils/installOptions";
import {
  isModerationFailure,
  moderatePackFields,
} from "../utils/contentModeration";

const ACTIVE_PUBLIC_PACK_FILTER = { visibility: "public", status: "active" };
const MAX_LIST_LIMIT = 1000;
const MIN_SEARCH_LENGTH = 3;

export class PackError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function normalizeAppSnapshot(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid apps.");
  }

  const appId = (item.appId || item._id || "").trim();
  if (!appId) {
    throw new Error("Invalid apps.");
  }

  const appName = (item.appName ?? item.name ?? "").trim();
  if (!appName) {
    throw new Error("Invalid apps.");
  }

  const snapshot = {
    appId,
    appName,
    appVersion: String(item.appVersion ?? item.latestVersion ?? ""),
  };

  if (item.icon) {
    snapshot.icon = String(item.icon);
  }

  if (item.publisher) {
    snapshot.publisher = String(item.publisher);
  }

  const installOptions = normalizeInstallOptions(item.installOptions);
  if (hasInstallOptions(installOptions)) {
    snapshot.installOptions = installOptions;
  }

  return snapshot;
}

function parseAppsInput(raw) {
  let apps = raw;

  if (typeof apps === "string") {
    apps = JSON.parse(apps);
  }

  if (!Array.isArray(apps)) {
    throw new Error("Invalid apps.");
  }

  return apps.map((item) => {
    if (typeof item === "string") {
      throw new Error("Invalid apps.");
    }

    return normalizeAppSnapshot(item);
  });
}

function parseAppsInputOptional(raw) {
  if (raw === undefined) {
    return undefined;
  }

  return parseAppsInput(raw);
}

function isValidVisibility(value) {
  return VISIBILITY.includes(value);
}

export function formatAppForResponse(app) {
  if (!app) {
    return null;
  }

  const appId = app.appId || app._id;
  if (!appId) {
    return null;
  }

  const formatted = {
    _id: appId,
    name: app.appName ?? app.name,
    latestVersion: app.appVersion ?? app.latestVersion ?? "",
    icon: app.icon,
    publisher: app.publisher,
  };

  if (hasInstallOptions(app.installOptions)) {
    formatted.installOptions = normalizeInstallOptions(app.installOptions);
  }

  return formatted;
}

export function formatPackForResponse(pack) {
  if (!pack) {
    return pack;
  }

  return {
    ...pack,
    apps: (pack.apps || []).map(formatAppForResponse).filter(Boolean),
  };
}

export function formatPacksForResponse(packs) {
  return (packs || []).map(formatPackForResponse);
}

export function assertAuthenticated(userId) {
  if (!userId) {
    throw new PackError("Authentication required", 401);
  }
}

async function findOwnedActivePack(packId, userId) {
  const pack = await Pack.findOne({ _id: packId, status: "active" }).exec();

  if (!pack) {
    throw new PackError("Pack not found.", 404);
  }

  if (pack.userId !== userId) {
    throw new PackError("Could not authenticate request.", 403);
  }

  return pack;
}

function parseSearchQuery(q) {
  if (q === undefined || q === null || q === "") {
    return null;
  }

  const trimmed = String(q).trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length < MIN_SEARCH_LENGTH) {
    throw new PackError(
      `Search query must be at least ${MIN_SEARCH_LENGTH} characters.`,
      400
    );
  }

  return trimmed;
}

function parseListQuery({ offset, limit } = {}) {
  const parsedOffset = offset !== undefined ? Number(offset) : 0;
  const parsedLimit = limit !== undefined ? Number(limit) : 100;

  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    throw new PackError("Invalid offset.", 400);
  }

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    throw new PackError("Invalid limit.", 400);
  }

  return {
    offset: parsedOffset,
    limit: Math.min(parsedLimit, MAX_LIST_LIMIT),
  };
}

export function canViewPack(pack, userId) {
  if (pack.status !== "active") return false;
  if (pack.visibility !== "private") return true;
  return userId === pack.userId;
}

export function canEditPack(pack, userId) {
  return pack.status === "active" && userId === pack.userId;
}

export async function createPack(userId, { name, description, apps, visibility }) {
  if (!name || !description || visibility === undefined) {
    throw new PackError("You are missing a required attribute.", 400);
  }

  if (!isValidVisibility(visibility)) {
    throw new PackError("Invalid visibility.", 400);
  }

  let parsedApps = [];
  try {
    parsedApps = parseAppsInputOptional(apps) ?? [];
  } catch (err) {
    throw new PackError(err.message, 400);
  }

  const moderation = moderatePackFields({ name, description });
  if (isModerationFailure(moderation)) {
    return moderation;
  }

  const doc = await Pack.create({
    userId,
    name,
    description,
    apps: parsedApps,
    visibility,
    status: "active",
  });

  return doc.toObject();
}

export async function listPublicPacks({
  offset,
  limit,
  sort = "recent",
  q,
  metadataOnly = false,
} = {}) {
  const { offset: safeOffset, limit: safeLimit } = parseListQuery({
    offset,
    limit,
  });
  const sortMode = sort === "popular" ? "popular" : "recent";
  const searchQuery = parseSearchQuery(q);
  const filter = searchQuery
    ? { ...ACTIVE_PUBLIC_PACK_FILTER, $text: { $search: searchQuery } }
    : ACTIVE_PUBLIC_PACK_FILTER;

  const total = await Pack.countDocuments(filter);

  if (metadataOnly) {
    return {
      total,
      offset: safeOffset,
      limit: safeLimit,
      data: [],
    };
  }

  const sortSpec =
    sortMode === "popular"
      ? { "stats.likeCount": -1, createdAt: -1 }
      : { createdAt: -1 };

  let query = Pack.find(filter);

  if (searchQuery) {
    query = query
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 });
  } else {
    query = query.sort(sortSpec);
  }

  const data = await query.skip(safeOffset).limit(safeLimit).lean().exec();

  return {
    total,
    offset: safeOffset,
    limit: safeLimit,
    data,
  };
}

export async function getPackById(packId, userId) {
  const pack = await Pack.findOne({ _id: packId, status: "active" })
    .lean()
    .exec();

  if (!pack) {
    throw new PackError(`Could not find pack with ID: ${packId}`, 404);
  }

  if (!canViewPack(pack, userId)) {
    throw new PackError(`Could not find pack with ID: ${packId}`, 404);
  }

  return formatPackForResponse(pack);
}

export async function listPacksByUser(userId) {
  return Pack.find({ userId, status: "active" })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

export async function listPublicPacksByUser(userId) {
  return Pack.find({
    userId,
    visibility: "public",
    status: "active",
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

export async function updatePack(
  packId,
  userId,
  { name, description, apps, visibility }
) {
  if (
    name === undefined &&
    description === undefined &&
    apps === undefined &&
    visibility === undefined
  ) {
    throw new PackError("No fields to update.", 400);
  }

  if (name !== undefined && !name) {
    throw new PackError("You are missing a required attribute.", 400);
  }

  if (description !== undefined && !description) {
    throw new PackError("You are missing a required attribute.", 400);
  }

  if (visibility !== undefined && !isValidVisibility(visibility)) {
    throw new PackError("Invalid visibility.", 400);
  }

  let parsedApps;
  try {
    parsedApps = parseAppsInputOptional(apps);
  } catch (err) {
    throw new PackError(err.message, 400);
  }

  const fieldsToCheck = {};
  if (name !== undefined) {
    fieldsToCheck.name = name;
  }
  if (description !== undefined) {
    fieldsToCheck.description = description;
  }

  if (Object.keys(fieldsToCheck).length > 0) {
    const moderation = moderatePackFields(fieldsToCheck);
    if (isModerationFailure(moderation)) {
      return moderation;
    }
  }

  const pack = await findOwnedActivePack(packId, userId);

  if (name !== undefined) {
    pack.name = name;
  }

  if (description !== undefined) {
    pack.description = description;
  }

  if (parsedApps !== undefined) {
    pack.apps = parsedApps;
  }

  if (visibility !== undefined) {
    pack.visibility = visibility;
  }

  const result = await pack.save();
  return result.toObject();
}

export async function deletePack(packId, userId) {
  const pack = await findOwnedActivePack(packId, userId);

  await PackLike.deleteMany({ packId: pack._id }).exec();
  await Pack.deleteOne({ _id: pack._id }).exec();

  return { msg: "Sucessfully deleted pack." };
}

export async function copyPack(sourcePackId, userId) {
  assertAuthenticated(userId);

  const source = await Pack.findOne({ _id: sourcePackId, status: "active" })
    .lean()
    .exec();

  if (!source) {
    throw new PackError("Pack not found.", 404);
  }

  if (!canViewPack(source, userId)) {
    throw new PackError("Pack not found.", 404);
  }

  const doc = await Pack.create({
    userId,
    name: source.name,
    description: source.description,
    apps: source.apps || [],
    visibility: "private",
    status: "active",
  });

  return doc.toObject();
}
