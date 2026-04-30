import { readSessionToken, verifySessionToken } from "../auth.js";

export function getRequestUserValue(req) {
  const session = verifySessionToken(readSessionToken(req));
  return String(session?.sub || req.get("x-user-id") || process.env.DEFAULT_USER_ID || "700901");
}
