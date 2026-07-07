import { connectMongoose } from "../../../lib/mongoose";
import {
  formatPacksForResponse,
  listPublicPacks,
} from "../../../service/packService";
import { sendPackError } from "./session";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { offset, limit, sort, q } = req.query;

  try {
    await connectMongoose();
    const result = await listPublicPacks({ offset, limit, sort, q });
    return res.status(200).json({ 
      ...result,
      data: formatPacksForResponse(result.data),
    });
  } catch (err) {
    return sendPackError(res, err);
  }
}
