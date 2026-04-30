import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { hashPassword } from "../../shared/auth.js";
import { pool, query } from "../../shared/postgres.js";
import { assertCompaniesExist, assertRolesExist, employeeDbIdFromInput, ensureReady, initialPasswordForEmployee, normalizeUserInput, toUser } from "./helpers.js";
import { getEmployeeForUser, getUserRow, replaceUserCompanies, replaceUserRoles } from "./db.js";
import { selectUserSql } from "./queries.js";

export async function listUserLookups(_req, res, next) {
  try { await ensureReady(); const [employeesResult, rolesResult, companiesResult] = await Promise.all([query(`SELECT e.id::text AS id, e.employee_id AS "employeeId", e.name, e.email, f.id::text AS "companyId", f.name AS "companyName" FROM employees e LEFT JOIN companies f ON f.id = e.company_id ORDER BY e.employee_id ASC`), query(`SELECT r.id::text AS id, r.name, r.scope, r.description, COALESCE(array_remove(array_agg(DISTINCT p.key), NULL), ARRAY[]::text[]) AS "permissionKeys" FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id LEFT JOIN permissions p ON p.id = rp.permission_id GROUP BY r.id ORDER BY r.name ASC`), query("SELECT id::text AS id, name FROM companies WHERE is_active = 1 ORDER BY name ASC")]); res.json({ employees: employeesResult.rows, roles: rolesResult.rows, facilities: companiesResult.rows, companies: companiesResult.rows }); } catch (error) { next(error); }
}

export async function listUsers(_req, res, next) {
  try { await ensureReady(); const result = await query(`${selectUserSql} GROUP BY u.id, e.id, f.id, ce.id, cu.id, ue.id, uu.id ORDER BY u.username ASC`); res.json(result.rows.map(toUser)); } catch (error) { next(error); }
}

export async function getUser(req, res, next) {
  try { await ensureReady(); const row = await getUserRow(req.params.id); if (!row) return res.status(404).json({ error: "not_found" }); res.json(toUser(row)); } catch (error) { next(error); }
}

export async function createUser(req, res, next) {
  try { await ensureReady(); const user = normalizeUserInput(req.body || {}); const actor = await getRequestActor(req); const employeeDbId = await employeeDbIdFromInput(user.employeeDbId); if (!employeeDbId) throw new Error("Invalid employee."); await assertRolesExist(user.roleIds); await assertCompaniesExist(user.companyAccessIds); const client = await pool.connect(); try { await client.query("BEGIN"); const employee = await getEmployeeForUser(employeeDbId, client); if (!employee) throw new Error("Invalid employee."); const username = String(employee.employee_id); const email = String(employee.email).trim().toLowerCase(); const result = await client.query(`INSERT INTO users (employee_id, username, email, status, password_hash, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`, [employeeDbId, username, email, user.status, initialPasswordForEmployee(employee), actor.id]); await replaceUserRoles(client, result.rows[0].id, user.roleIds); await replaceUserCompanies(client, result.rows[0].id, user.companyAccessIds); const created = await getUserRow(result.rows[0].id, client); await writeAuditLog({ tableName: "users", rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toUser(created) }, client); await client.query("COMMIT"); res.status(201).json(toUser(created)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function updateUser(req, res, next) {
  try { await ensureReady(); const existing = await getUserRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const user = normalizeUserInput(req.body || {}); const actor = await getRequestActor(req); const employeeDbId = await employeeDbIdFromInput(user.employeeDbId); if (!employeeDbId) throw new Error("Invalid employee."); await assertRolesExist(user.roleIds); await assertCompaniesExist(user.companyAccessIds); const client = await pool.connect(); try { await client.query("BEGIN"); const employee = await getEmployeeForUser(employeeDbId, client); if (!employee) throw new Error("Invalid employee."); const username = String(employee.employee_id); const email = String(employee.email).trim().toLowerCase(); await client.query(`UPDATE users SET employee_id = $2, username = $3, email = $4, status = $5, updated_by_user_id = $6, updated_at = NOW() WHERE id = $1`, [existing.id, employeeDbId, username, email, user.status, actor.id]); await replaceUserRoles(client, existing.id, user.roleIds); await replaceUserCompanies(client, existing.id, user.companyAccessIds); const updated = await getUserRow(existing.id, client); await writeAuditLog({ tableName: "users", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toUser(existing), newData: toUser(updated) }, client); await client.query("COMMIT"); res.json(toUser(updated)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function resetUserPassword(req, res, next) {
  try { await ensureReady(); const existing = await getUserRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const actor = await getRequestActor(req); const result = await query(`UPDATE users u SET password_hash = $3, updated_by_user_id = $2, updated_at = NOW() FROM employees e WHERE u.employee_id = e.id AND u.id = $1 RETURNING e.employee_id::text AS password`, [existing.id, actor.id, hashPassword(String(existing.employeeId))]); if (!result.rowCount) return res.status(404).json({ error: "employee_not_found" }); await writeAuditLog({ tableName: "users", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toUser(existing), newData: { ...toUser(existing), passwordReset: true, updatedByUserId: String(actor.id) } }); res.json({ ok: true, password: result.rows[0].password }); } catch (error) { next(error); }
}

export async function deleteUser(req, res, next) {
  try { await ensureReady(); const existing = await getUserRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query("DELETE FROM users WHERE id = $1", [existing.id]); await writeAuditLog({ tableName: "users", rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toUser(existing), newData: null }, client); await client.query("COMMIT"); res.json({ ok: true }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}
