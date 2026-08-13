import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PackError } from "../../../service/packService";
import { isPackApiViaWinstall } from "../../../utils/packApiConfig";

export function logLocalPackApiDeprecation(req) {
  if (!isPackApiViaWinstall()) return;
  const method = req?.method || "?";
  const url = req?.url || "?";
  console.warn(
    `[packs API] Deprecated local handler hit while PACK_API_VIA_WINSTALL is on: ${method} ${url}`
  );
}

export async function requireSessionUser(req, res) {
  logLocalPackApiDeprecation(req);
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  return userId;
}

export async function getOptionalSessionUser(req, res) {
  logLocalPackApiDeprecation(req);
  const session = await getServerSession(req, res, authOptions);
  return session?.user?.id ?? null;
}

export function sendPackError(res, err) {
  if (err instanceof PackError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error("[packs API]", err);
  return res
    .status(500)
    .json({ error: err.message || "Something went wrong." });
}

export function isPackServiceFailure(result) {
  return Boolean(result && result.ok === false);
}

export function sendPackServiceResult(res, result, onSuccess) {
  if (isPackServiceFailure(result)) {
    return res.status(400).json({ error: result.error });
  }

  return onSuccess(result);
}
