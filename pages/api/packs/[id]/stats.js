import { connectMongoose } from "../../../../lib/mongoose";
import {
  incrementViewCount,
  incrementDownloadCount,
} from "../../../../service/packService";
import { sendPackError } from "../session";

export default async function handler(req, res) {
  const { id } = req.query;
  const { type } = req.body || {};

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid pack id." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!type || !["view", "download"].includes(type)) {
    return res.status(400).json({ error: "Invalid type. Must be 'view' or 'download'." });
  }

  try {
    await connectMongoose();

    if (type === "view") {
      const result = await incrementViewCount(id);
      return res.status(200).json(result);
    }

    if (type === "download") {
      const result = await incrementDownloadCount(id);
      return res.status(200).json(result);
    }
  } catch (err) {
    return sendPackError(res, err);
  }
}
