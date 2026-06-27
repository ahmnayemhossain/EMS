import { Router } from "express";

import {
  createSessionToken,
  hashPassword,
  readSessionToken,
  verifyPassword,
  verifySessionToken,
} from "../shared/auth.js";
import { sendLoginLogEmail } from "../shared/login-log-email.js";
import { ensureCoreSchema } from "../shared/schema.js";
import { query } from "../shared/postgres.js";

export const authRouter = Router();

function toAuthUser(row) {
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    name: row.name || row.username,
    employeeId: row.employee_id ? Number(row.employee_id) : undefined,
    status: row.status,
  };
}

async function getAuthUserByLogin(login) {
  const normalized = String(login || "").trim().toLowerCase();
  if (!normalized) return null;

  const result = await query(
    `
      SELECT
        u.id,
        u.username,
        u.email,
        u.status,
        u.password_hash,
        e.employee_id,
        e.name
      FROM users u
      LEFT JOIN employees e ON e.id = u.employee_id
      WHERE LOWER(u.username) = $1
         OR LOWER(u.email) = $1
         OR e.employee_id::text = $2
      LIMIT 1
    `,
    [normalized, String(login || "").trim()],
  );

  return result.rows[0] || null;
}

async function getAuthUserById(id) {
  const result = await query(
    `
      SELECT
        u.id,
        u.username,
        u.email,
        u.status,
        u.password_hash,
        e.employee_id,
        e.name
      FROM users u
      LEFT JOIN employees e ON e.id = u.employee_id
      WHERE u.id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] || null;
}

authRouter.post("/sign-in", async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const login = String(req.body?.login || "").trim();
    const password = String(req.body?.password || "");
    const row = await getAuthUserByLogin(login);

    if (!row || row.status !== "active" || !verifyPassword(password, row.password_hash)) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    if (!String(row.password_hash || "").startsWith("scrypt$")) {
      await query("UPDATE users SET password_hash = $2, last_login_at = NOW() WHERE id = $1", [
        row.id,
        hashPassword(password),
      ]);
    } else {
      await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [row.id]);
    }

    res.json({
      token: createSessionToken(row),
      user: toAuthUser(row),
    });

    void sendLoginLogEmail({ req, user: toAuthUser(row) }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("[login-log-email]", error instanceof Error ? error.message : error);
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/sign-out", (req, res) => {
  const token = readSessionToken(req);
  const session = verifySessionToken(token);
  res.json({ ok: true, signedOut: Boolean(session) });
});

authRouter.post("/change-password", async (req, res, next) => {
  try {
    await ensureCoreSchema();

    const session = verifySessionToken(readSessionToken(req));
    if (!session?.sub) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required." });
    }

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from current password." });
    }

    const row = await getAuthUserById(session.sub);
    if (!row || row.status !== "active") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!verifyPassword(currentPassword, row.password_hash)) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    await query(
      "UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1",
      [row.id, hashPassword(newPassword)],
    );

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
