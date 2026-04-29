import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { assertRoleDeleteAllowed } from "../../shared/delete-guards.js";
import { pool, query } from "../../shared/postgres.js";
import { permissionOptions } from "./catalog.js";
import { getRoleRow, replaceRolePermissions } from "./db.js";
import { assertPermissionsExist, ensureReady, normalizeRoleInput, toRole } from "./helpers.js";
import { selectRoleSql } from "./queries.js";

export async function listRoleLookups(_req, res, next) {
  try { await ensureReady(); const result = await query("SELECT key FROM permissions"); const existing = new Set(result.rows.map((row) => row.key)); res.json({ permissions: permissionOptions.filter((option) => existing.has(option.key)).map(({ order, ...option }) => option) }); } catch (error) { next(error); }
}

export async function listRoles(_req, res, next) {
  try { await ensureReady(); const result = await query(`${selectRoleSql} GROUP BY r.id, ce.id, cu.id, ue.id, uu.id ORDER BY r.name ASC`); res.json(result.rows.map(toRole)); } catch (error) { next(error); }
}

export async function createRole(req, res, next) {
  try { await ensureReady(); const role = normalizeRoleInput(req.body || {}); const actor = await getRequestActor(req); await assertPermissionsExist(role.permissionKeys); const client = await pool.connect(); try { await client.query("BEGIN"); const result = await client.query(`INSERT INTO roles (name, scope, description, is_active, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $5, $5) RETURNING id`, [role.name, role.scope, role.description, role.status, actor.id]); await replaceRolePermissions(client, result.rows[0].id, role.permissionKeys); const created = await getRoleRow(result.rows[0].id, client); await writeAuditLog({ tableName: "roles", rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toRole(created) }, client); await client.query("COMMIT"); res.status(201).json(toRole(created)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function updateRole(req, res, next) {
  try { await ensureReady(); const existing = await getRoleRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const role = normalizeRoleInput(req.body || {}); const actor = await getRequestActor(req); await assertPermissionsExist(role.permissionKeys); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`UPDATE roles SET name = $2, scope = $3, description = $4, is_active = $5, updated_by_user_id = $6, updated_at = NOW() WHERE id = $1`, [existing.id, role.name, role.scope, role.description, role.status, actor.id]); await replaceRolePermissions(client, existing.id, role.permissionKeys); const updated = await getRoleRow(existing.id, client); await writeAuditLog({ tableName: "roles", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toRole(existing), newData: toRole(updated) }, client); await client.query("COMMIT"); res.json(toRole(updated)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function deleteRole(req, res, next) {
  try { await ensureReady(); const existing = await getRoleRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); await assertRoleDeleteAllowed(existing.id); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query("DELETE FROM roles WHERE id = $1", [existing.id]); await writeAuditLog({ tableName: "roles", rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toRole(existing), newData: null }, client); await client.query("COMMIT"); res.json({ ok: true }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}
