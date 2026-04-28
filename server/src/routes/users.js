import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { hashPassword } from "../shared/auth.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

export const usersRouter = Router();

let readyPromise;

function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await ensureCoreSchema();
      await query(`
        CREATE TABLE IF NOT EXISTS user_companies (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
          company_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
          UNIQUE (user_id, company_id)
        );

        INSERT INTO user_companies (user_id, company_id)
        SELECT u.id, e.company_id
        FROM users u
        JOIN employees e ON e.id = u.employee_id
        WHERE e.company_id IS NOT NULL
        ON CONFLICT (user_id, company_id) DO NOTHING;
      `);
    })();
  }
  return readyPromise;
}

function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

function toUser(row) {
  return {
    id: String(row.id),
    employeeDbId: row.employee_db_id ? String(row.employee_db_id) : undefined,
    employeeId: Number(row.employee_number),
    employeeName: row.employee_name || undefined,
    companyId: row.company_id ? String(row.company_id) : undefined,
    companyName: row.company_name || undefined,
    username: row.username,
    email: row.email,
    roleIds: Array.isArray(row.role_ids) ? row.role_ids.map(String) : [],
    companyAccessIds: Array.isArray(row.company_access_ids) ? row.company_access_ids.map(String) : [],
    status: row.status,
    lastLoginAt: toDateTime(row.last_login_at),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: toDateTime(row.created_at),
    updatedAt: toDateTime(row.updated_at),
  };
}

function requiredString(input, key, label) {
  const value = String(input[key] || "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function normalizeUserInput(input) {
  const employeeDbId = Number(input.employeeDbId || input.employeeId);
  if (!Number.isFinite(employeeDbId) || employeeDbId <= 0) throw new Error("Employee is required.");

  const roleIds = Array.isArray(input.roleIds)
    ? input.roleIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
    : [];
  if (!roleIds.length) throw new Error("At least one role is required.");

  const companyAccessIds = Array.isArray(input.companyAccessIds)
    ? input.companyAccessIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
    : [];
  if (!companyAccessIds.length) throw new Error("At least one company access is required.");

  const status = String(input.status || "active");
  if (!["active", "suspended"].includes(status)) throw new Error("Invalid user status.");

  return {
    employeeDbId,
    roleIds,
    companyAccessIds,
    status,
  };
}

async function employeeDbIdFromInput(value) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) return null;

  const result = await query("SELECT id FROM employees WHERE id = $1", [id]);
  if (result.rows[0]?.id) return result.rows[0].id;

  const byEmployeeNumber = await query("SELECT id FROM employees WHERE employee_id = $1", [id]);
  return byEmployeeNumber.rows[0]?.id ?? null;
}

async function assertRolesExist(roleIds) {
  const result = await query("SELECT id FROM roles WHERE id = ANY($1::bigint[])", [roleIds]);
  if (result.rowCount !== roleIds.length) throw new Error("Invalid role.");
}

async function assertCompaniesExist(companyIds) {
  const result = await query("SELECT id FROM companies WHERE id = ANY($1::bigint[])", [companyIds]);
  if (result.rowCount !== companyIds.length) throw new Error("Invalid company access.");
}

async function getEmployeeForUser(employeeDbId, db = { query }) {
  const result = await db.query(
    "SELECT id, employee_id, email FROM employees WHERE id = $1",
    [employeeDbId],
  );
  return result.rows[0] || null;
}

function initialPasswordForEmployee(employee) {
  return hashPassword(String(employee.employee_id));
}

async function replaceUserRoles(client, userId, roleIds) {
  await client.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
  for (const roleId of roleIds) {
    await client.query(
      `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, role_id) DO NOTHING
      `,
      [userId, roleId],
    );
  }
}

async function replaceUserCompanies(client, userId, companyIds) {
  await client.query("DELETE FROM user_companies WHERE user_id = $1", [userId]);
  for (const companyId of companyIds) {
    await client.query(
      `
        INSERT INTO user_companies (user_id, company_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, company_id) DO NOTHING
      `,
      [userId, companyId],
    );
  }
}

const selectUserSql = `
  SELECT
    u.*,
    e.id AS employee_db_id,
    e.employee_id AS employee_number,
    e.name AS employee_name,
    f.id AS company_id,
    f.name AS company_name,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name,
    COALESCE(
      array_remove(array_agg(DISTINCT ur.role_id), NULL),
      ARRAY[]::bigint[]
    ) AS role_ids,
    COALESCE(
      array_remove(array_agg(DISTINCT uf.company_id), NULL),
      ARRAY[]::bigint[]
    ) AS company_access_ids
  FROM users u
  LEFT JOIN employees e ON e.id = u.employee_id
  LEFT JOIN companies f ON f.id = e.company_id
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  LEFT JOIN user_companies uf ON uf.user_id = u.id
  LEFT JOIN users cu ON cu.id = u.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = u.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

async function getUserRow(id, db = { query }) {
  const result = await db.query(
    `
      ${selectUserSql}
      WHERE u.id::text = $1
      GROUP BY u.id, e.id, f.id, ce.id, cu.id, ue.id, uu.id
    `,
    [String(id)],
  );
  return result.rows[0] || null;
}

usersRouter.get("/lookups/options", async (_req, res, next) => {
  try {
    await ensureReady();
    const [employeesResult, rolesResult, companiesResult] = await Promise.all([
      query(`
        SELECT
          e.id::text AS id,
          e.employee_id AS "employeeId",
          e.name,
          e.email,
          f.id::text AS "companyId",
          f.name AS "companyName"
        FROM employees e
        LEFT JOIN companies f ON f.id = e.company_id
        ORDER BY e.employee_id ASC
      `),
      query(`
        SELECT
          r.id::text AS id,
          r.name,
          r.scope,
          r.description,
          COALESCE(
            array_remove(array_agg(DISTINCT p.key), NULL),
            ARRAY[]::text[]
          ) AS "permissionKeys"
        FROM roles r
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        GROUP BY r.id
        ORDER BY r.name ASC
      `),
      query("SELECT id::text AS id, name FROM companies WHERE is_active = 1 ORDER BY name ASC"),
    ]);

    res.json({
      employees: employeesResult.rows,
      roles: rolesResult.rows,
      facilities: companiesResult.rows,
      companies: companiesResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", requirePermission("settings:users:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    const result = await query(`
      ${selectUserSql}
      GROUP BY u.id, e.id, f.id, ce.id, cu.id, ue.id, uu.id
      ORDER BY u.username ASC
    `);
    res.json(result.rows.map(toUser));
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", requirePermission("settings:users:read"), async (req, res, next) => {
  try {
    await ensureReady();
    const row = await getUserRow(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(toUser(row));
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", requirePermission("settings:users:write"), async (req, res, next) => {
  try {
    await ensureReady();
    const user = normalizeUserInput(req.body || {});
    const actor = await getRequestActor(req);
    const employeeDbId = await employeeDbIdFromInput(user.employeeDbId);
    if (!employeeDbId) throw new Error("Invalid employee.");
    await assertRolesExist(user.roleIds);
    await assertCompaniesExist(user.companyAccessIds);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const employee = await getEmployeeForUser(employeeDbId, client);
      if (!employee) throw new Error("Invalid employee.");
      const username = String(employee.employee_id);
      const email = String(employee.email).trim().toLowerCase();
      const result = await client.query(
        `
          INSERT INTO users (
            employee_id, username, email, status, password_hash,
            created_by_user_id, updated_by_user_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $6)
          RETURNING id
        `,
        [employeeDbId, username, email, user.status, initialPasswordForEmployee(employee), actor.id],
      );

      await replaceUserRoles(client, result.rows[0].id, user.roleIds);
      await replaceUserCompanies(client, result.rows[0].id, user.companyAccessIds);
      const created = await getUserRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: "users",
          rowId: result.rows[0].id,
          action: "create",
          actorUserId: actor.id,
          oldData: null,
          newData: toUser(created),
        },
        client,
      );
      await client.query("COMMIT");
      res.status(201).json(toUser(created));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", requirePermission("settings:users:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getUserRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const user = normalizeUserInput(req.body || {});
    const actor = await getRequestActor(req);
    const employeeDbId = await employeeDbIdFromInput(user.employeeDbId);
    if (!employeeDbId) throw new Error("Invalid employee.");
    await assertRolesExist(user.roleIds);
    await assertCompaniesExist(user.companyAccessIds);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const employee = await getEmployeeForUser(employeeDbId, client);
      if (!employee) throw new Error("Invalid employee.");
      const username = String(employee.employee_id);
      const email = String(employee.email).trim().toLowerCase();
      await client.query(
        `
          UPDATE users
          SET
            employee_id = $2,
            username = $3,
            email = $4,
            status = $5,
            updated_by_user_id = $6,
            updated_at = NOW()
          WHERE id = $1
        `,
        [existing.id, employeeDbId, username, email, user.status, actor.id],
      );

      await replaceUserRoles(client, existing.id, user.roleIds);
      await replaceUserCompanies(client, existing.id, user.companyAccessIds);
      const updated = await getUserRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: "users",
          rowId: existing.id,
          action: "update",
          actorUserId: actor.id,
          oldData: toUser(existing),
          newData: toUser(updated),
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toUser(updated));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:id/reset-password", requirePermission("settings:users:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getUserRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const actor = await getRequestActor(req);

    const result = await query(
      `
        UPDATE users u
        SET password_hash = $3,
            updated_by_user_id = $2,
            updated_at = NOW()
        FROM employees e
        WHERE u.employee_id = e.id
          AND u.id = $1
        RETURNING e.employee_id::text AS password
      `,
      [existing.id, actor.id, hashPassword(String(existing.employeeId))],
    );
    if (!result.rowCount) return res.status(404).json({ error: "employee_not_found" });
    await writeAuditLog({
      tableName: "users",
      rowId: existing.id,
      action: "update",
      actorUserId: actor.id,
      oldData: toUser(existing),
      newData: { ...toUser(existing), passwordReset: true, updatedByUserId: String(actor.id) },
    });
    res.json({ ok: true, password: result.rows[0].password });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:id", requirePermission("settings:users:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getUserRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM users WHERE id = $1", [existing.id]);
      await writeAuditLog(
        {
          tableName: "users",
          rowId: existing.id,
          action: "delete",
          actorUserId: actor.id,
          oldData: toUser(existing),
          newData: null,
        },
        client,
      );
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});
