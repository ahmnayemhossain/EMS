import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { assertRoleDeleteAllowed } from "../shared/delete-guards.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

export const rolesRouter = Router();

const permissionCatalog = [
  ["Dashboard", "dashboard:read", "Read"],
  ["Dashboard", "dashboard:customize", "Customize"],
  ["Audit calendar", "audit-calendar:read", "Read"],
  ["Audit calendar", "audit-calendar:write", "Write"],
  ["Audit calendar", "audit-calendar:update", "Update"],
  ["Audit calendar", "audit-calendar:delete", "Delete"],
  ["Company dashboard", "companies:read", "Read"],
  ["Utilities", "utilities:read", "Read"],
  ["Utilities", "utilities:write", "Write"],
  ["Utilities", "utilities:update", "Update"],
  ["Utilities", "utilities:delete", "Delete"],
  ["Chemicals", "chemicals:read", "Read"],
  ["Chemicals", "chemicals:write", "Write"],
  ["Chemicals", "chemicals:update", "Update"],
  ["Chemicals", "chemicals:delete", "Delete"],
  ["SDS / MSDS", "sds:read", "Read"],
  ["SDS / MSDS", "sds:write", "Write"],
  ["SDS / MSDS", "sds:update", "Update"],
  ["SDS / MSDS", "sds:delete", "Delete"],
  ["Waste", "waste:read", "Read"],
  ["Waste", "waste:write", "Write"],
  ["Waste", "waste:update", "Update"],
  ["Waste", "waste:delete", "Delete"],
  ["Wastewater / ETP", "wastewater:read", "Read"],
  ["Wastewater / ETP", "wastewater:write", "Write"],
  ["Wastewater / ETP", "wastewater:update", "Update"],
  ["Wastewater / ETP", "wastewater:delete", "Delete"],
  ["Audits", "audits:read", "Read"],
  ["Audits", "audits:write", "Write"],
  ["Audits", "audits:update", "Update"],
  ["Audits", "audits:delete", "Delete"],
  ["CAPA", "capa:read", "Read"],
  ["CAPA", "capa:write", "Write"],
  ["CAPA", "capa:update", "Update"],
  ["CAPA", "capa:delete", "Delete"],
  ["Reports", "reports:read", "Read"],
  ["Reports", "reports:export", "Export"],
  ["Documents", "documents:read", "Read"],
  ["Documents", "documents:write", "Write"],
  ["Documents", "documents:update", "Update"],
  ["Documents", "documents:delete", "Delete"],
  ["Complaint box", "complaints:read", "Read"],
  ["Complaint box", "complaints:write", "Write"],
  ["Complaint box", "complaints:update", "Update"],
  ["Complaint box", "complaints:delete", "Delete"],
  ["Complaint box", "complaints:triage", "Triage"],
  ["Complaint box", "complaints:handle", "Handle"],
  ["Complaint box", "complaints:export", "Export"],
  ["Worker report box", "report-box:read", "Read"],
  ["Worker report box", "report-box:write", "Write"],
  ["Worker report box", "report-box:update", "Update"],
  ["Worker report box", "report-box:delete", "Delete"],
  ["Incidents", "incidents:read", "Read"],
  ["Incidents", "incidents:write", "Write"],
  ["Incidents", "incidents:update", "Update"],
  ["Incidents", "incidents:delete", "Delete"],
  ["Training", "training:read", "Read"],
  ["Training", "training:write", "Write"],
  ["Training", "training:update", "Update"],
  ["Training", "training:delete", "Delete"],
  ["Notifications", "notifications:read", "Read"],
  ["Notifications", "notifications:write", "Write"],
  ["Notifications", "notifications:update", "Update"],
  ["Notifications", "notifications:delete", "Delete"],
  ["Settings", "settings:read", "Read"],
  ["Settings", "settings:manage", "Manage all"],
  ["Settings - Employees", "settings:employees:read", "Read"],
  ["Settings - Employees", "settings:employees:write", "Write"],
  ["Settings - Employees", "settings:employees:update", "Update"],
  ["Settings - Employees", "settings:employees:delete", "Delete"],
  ["Settings - Users", "settings:users:read", "Read"],
  ["Settings - Users", "settings:users:write", "Write"],
  ["Settings - Users", "settings:users:update", "Update"],
  ["Settings - Users", "settings:users:delete", "Delete"],
  ["Settings - Roles", "settings:roles:read", "Read"],
  ["Settings - Roles", "settings:roles:write", "Write"],
  ["Settings - Roles", "settings:roles:update", "Update"],
  ["Settings - Roles", "settings:roles:delete", "Delete"],
  ["Settings - Departments", "settings:departments:read", "Read"],
  ["Settings - Departments", "settings:departments:write", "Write"],
  ["Settings - Departments", "settings:departments:update", "Update"],
  ["Settings - Departments", "settings:departments:delete", "Delete"],
  ["Settings - Designations", "settings:designations:read", "Read"],
  ["Settings - Designations", "settings:designations:write", "Write"],
  ["Settings - Designations", "settings:designations:update", "Update"],
  ["Settings - Designations", "settings:designations:delete", "Delete"],
  ["Settings - Companies", "settings:companies:read", "Read"],
  ["Settings - Companies", "settings:companies:write", "Write"],
  ["Settings - Companies", "settings:companies:update", "Update"],
  ["Settings - Companies", "settings:companies:delete", "Delete"],
  ["Settings - UOM", "settings:uom:read", "Read"],
  ["Settings - UOM", "settings:uom:write", "Write"],
  ["Settings - UOM", "settings:uom:update", "Update"],
  ["Settings - UOM", "settings:uom:delete", "Delete"],
  ["Settings - UOM Wiring", "settings:uom-wiring:read", "Read"],
  ["Settings - UOM Wiring", "settings:uom-wiring:write", "Write"],
  ["Settings - UOM Wiring", "settings:uom-wiring:update", "Update"],
  ["Settings - UOM Wiring", "settings:uom-wiring:delete", "Delete"],
  ["Settings - Sources", "settings:sources:read", "Read"],
  ["Settings - Sources", "settings:sources:write", "Write"],
  ["Settings - Sources", "settings:sources:update", "Update"],
  ["Settings - Sources", "settings:sources:delete", "Delete"],
  ["Settings - Source Wiring", "settings:source-wiring:read", "Read"],
  ["Settings - Source Wiring", "settings:source-wiring:write", "Write"],
  ["Settings - Source Wiring", "settings:source-wiring:update", "Update"],
  ["Settings - Source Wiring", "settings:source-wiring:delete", "Delete"],
  ["Settings - Suppliers", "settings:suppliers:read", "Read"],
  ["Settings - Suppliers", "settings:suppliers:write", "Write"],
  ["Settings - Suppliers", "settings:suppliers:update", "Update"],
  ["Settings - Suppliers", "settings:suppliers:delete", "Delete"],
];

const permissionOptions = permissionCatalog.map(([group, key, action], index) => ({
  key,
  group,
  action,
  label: `${group} - ${action}`,
  order: index,
}));

let readyPromise;

function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

function toRole(row) {
  return {
    id: String(row.id),
    name: row.name,
    scope: row.scope,
    description: row.description || "",
    permissionKeys: Array.isArray(row.permission_keys) ? row.permission_keys.filter(Boolean) : [],
    status: Number(row.is_active ?? 1),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: toDateTime(row.created_at),
    updatedAt: toDateTime(row.updated_at),
  };
}

function normalizeRoleInput(input) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Role name is required.");

  const scope = String(input.scope || "company");
  if (!["group", "company"].includes(scope)) throw new Error("Invalid role scope.");

  const permissionKeys = Array.isArray(input.permissionKeys)
    ? input.permissionKeys.map((key) => String(key).trim()).filter(Boolean)
    : [];
  if (!permissionKeys.length) throw new Error("Select at least one permission.");

  const status = Number(input.status ?? input.isActive ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");

  return {
    name,
    scope,
    description: input.description ? String(input.description).trim() : null,
    permissionKeys,
    status,
  };
}

async function assertPermissionsExist(permissionKeys) {
  const result = await query("SELECT key FROM permissions WHERE key = ANY($1::text[])", [permissionKeys]);
  if (result.rowCount !== permissionKeys.length) throw new Error("Invalid permission.");
}

async function replaceRolePermissions(client, roleId, permissionKeys) {
  await client.query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);
  for (const permissionKey of permissionKeys) {
    await client.query(
      `
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, id
        FROM permissions
        WHERE key = $2
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `,
      [roleId, permissionKey],
    );
  }
}

const selectRoleSql = `
  SELECT
    r.*,
    COALESCE(
      array_remove(array_agg(DISTINCT p.key), NULL),
      ARRAY[]::text[]
    ) AS permission_keys,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM roles r
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
  LEFT JOIN users cu ON cu.id = r.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = r.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

async function getRoleRow(id, db = { query }) {
  const result = await db.query(
    `
      ${selectRoleSql}
      WHERE r.id::text = $1
      GROUP BY r.id, ce.id, cu.id, ue.id, uu.id
    `,
    [String(id)],
  );
  return result.rows[0] || null;
}

rolesRouter.get("/lookups/options", async (_req, res, next) => {
  try {
    await ensureReady();
    const result = await query("SELECT key FROM permissions");
    const existing = new Set(result.rows.map((row) => row.key));
    const permissions = permissionOptions
      .filter((option) => existing.has(option.key))
      .map(({ order, ...option }) => option);
    res.json({ permissions });
  } catch (error) {
    next(error);
  }
});

rolesRouter.get("/", requirePermission("settings:roles:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    const result = await query(`
      ${selectRoleSql}
      GROUP BY r.id, ce.id, cu.id, ue.id, uu.id
      ORDER BY r.name ASC
    `);
    res.json(result.rows.map(toRole));
  } catch (error) {
    next(error);
  }
});

rolesRouter.post("/", requirePermission("settings:roles:write"), async (req, res, next) => {
  try {
    await ensureReady();
    const role = normalizeRoleInput(req.body || {});
    const actor = await getRequestActor(req);
    await assertPermissionsExist(role.permissionKeys);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `
          INSERT INTO roles (name, scope, description, is_active, created_by_user_id, updated_by_user_id)
          VALUES ($1, $2, $3, $4, $5, $5)
          RETURNING id
        `,
        [role.name, role.scope, role.description, role.status, actor.id],
      );
      await replaceRolePermissions(client, result.rows[0].id, role.permissionKeys);
      const created = await getRoleRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: "roles",
          rowId: result.rows[0].id,
          action: "create",
          actorUserId: actor.id,
          oldData: null,
          newData: toRole(created),
        },
        client,
      );
      await client.query("COMMIT");
      res.status(201).json(toRole(created));
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

rolesRouter.put("/:id", requirePermission("settings:roles:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getRoleRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const role = normalizeRoleInput(req.body || {});
    const actor = await getRequestActor(req);
    await assertPermissionsExist(role.permissionKeys);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `
          UPDATE roles
          SET name = $2,
              scope = $3,
              description = $4,
              is_active = $5,
              updated_by_user_id = $6,
              updated_at = NOW()
          WHERE id = $1
        `,
        [existing.id, role.name, role.scope, role.description, role.status, actor.id],
      );
      await replaceRolePermissions(client, existing.id, role.permissionKeys);
      const updated = await getRoleRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: "roles",
          rowId: existing.id,
          action: "update",
          actorUserId: actor.id,
          oldData: toRole(existing),
          newData: toRole(updated),
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toRole(updated));
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

rolesRouter.delete("/:id", requirePermission("settings:roles:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getRoleRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    await assertRoleDeleteAllowed(existing.id);
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM roles WHERE id = $1", [existing.id]);
      await writeAuditLog(
        {
          tableName: "roles",
          rowId: existing.id,
          action: "delete",
          actorUserId: actor.id,
          oldData: toRole(existing),
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
