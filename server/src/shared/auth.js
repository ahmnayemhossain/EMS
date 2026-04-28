import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 12);
const PASSWORD_PREFIX = "scrypt$";

function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.PG_PASSWORD || "ems-local-session-secret";
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlJson(value) {
  return base64UrlEncode(JSON.stringify(value));
}

function signPayload(payload) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlJson({
    sub: String(user.id),
    username: user.username,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  });
  return `${payload}.${signPayload(payload)}`;
}

export function readSessionToken(req) {
  const header = String(req.get("authorization") || "");
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : "";
}

export function verifySessionToken(token) {
  const [payloadPart, signature] = String(token || "").split(".");
  if (!payloadPart || !signature) return null;

  const expected = signPayload(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    const exp = Number(payload.exp);
    if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(String(password), salt, 64).toString("base64url");
  return `${PASSWORD_PREFIX}${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  const stored = String(storedHash || "");
  if (!stored) return false;

  if (!stored.startsWith(PASSWORD_PREFIX)) {
    const passwordHash = createHash("sha256").update(String(password)).digest();
    const storedPlainHash = createHash("sha256").update(stored).digest();
    return timingSafeEqual(passwordHash, storedPlainHash);
  }

  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "base64url");
  const actual = Buffer.from(scryptSync(String(password), salt, 64).toString("base64url"), "base64url");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

