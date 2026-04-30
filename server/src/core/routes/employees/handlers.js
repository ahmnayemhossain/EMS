import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { assertEmployeeDeleteAllowed } from "../../shared/delete-guards.js";
import { pool, query } from "../../shared/postgres.js";
import { getEmployeeRow, getIdByValueOrThrow } from "./db.js";
import { ensureReady, getCompanyIdOrThrow, normalizeEmployeeInput, toEmployee } from "./helpers.js";
import { selectEmployeeSql } from "./queries.js";

export async function listEmployeeLookups(_req, res, next) {
  try { await ensureReady(); const [companiesResult, departmentsResult, designationsResult] = await Promise.all([query("SELECT id::text AS id, name FROM companies WHERE is_active = 1 ORDER BY name ASC"), query("SELECT id::text AS id, name FROM departments WHERE is_active = 1 ORDER BY name ASC"), query("SELECT id::text AS id, name FROM designations WHERE is_active = 1 ORDER BY name ASC")]); res.json({ facilities: companiesResult.rows, companies: companiesResult.rows, departments: departmentsResult.rows, designations: designationsResult.rows }); } catch (error) { next(error); }
}

export async function listEmployees(_req, res, next) {
  try { await ensureReady(); const result = await query(`${selectEmployeeSql} ORDER BY e.employee_id ASC`); res.json(result.rows.map(toEmployee)); } catch (error) { next(error); }
}

export async function getEmployee(req, res, next) {
  try { await ensureReady(); const row = await getEmployeeRow(req.params.id); if (!row) return res.status(404).json({ error: "not_found" }); res.json(toEmployee(row)); } catch (error) { next(error); }
}

export async function createEmployee(req, res, next) {
  try { await ensureReady(); const employee = normalizeEmployeeInput(req.body || {}); const actor = await getRequestActor(req); const companyId = await getCompanyIdOrThrow(employee.companyId); const departmentId = await getIdByValueOrThrow("departments", employee.departmentId, "department"); const designationId = await getIdByValueOrThrow("designations", employee.designationId, "designation"); const client = await pool.connect(); try { await client.query("BEGIN"); const result = await client.query(`INSERT INTO employees (employee_id, name, company_id, department_id, designation_id, is_active, email, phone, joined_on, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10) RETURNING id`, [employee.employeeId, employee.name, companyId, departmentId, designationId, employee.status, employee.email, employee.phone, employee.joinedOn, actor.id]); const created = await getEmployeeRow(result.rows[0].id, client); await writeAuditLog({ tableName: "employees", rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toEmployee(created) }, client); await client.query("COMMIT"); res.status(201).json(toEmployee(created)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function updateEmployee(req, res, next) {
  try { await ensureReady(); const existing = await getEmployeeRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const employee = normalizeEmployeeInput(req.body || {}); const actor = await getRequestActor(req); const companyId = await getCompanyIdOrThrow(employee.companyId); const departmentId = await getIdByValueOrThrow("departments", employee.departmentId, "department"); const designationId = await getIdByValueOrThrow("designations", employee.designationId, "designation"); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`UPDATE employees SET employee_id = $2, name = $3, company_id = $4, department_id = $5, designation_id = $6, is_active = $7, email = $8, phone = $9, joined_on = $10, updated_by_user_id = $11, updated_at = NOW() WHERE id = $1`, [existing.id, employee.employeeId, employee.name, companyId, departmentId, designationId, employee.status, employee.email, employee.phone, employee.joinedOn, actor.id]); const updated = await getEmployeeRow(existing.id, client); await writeAuditLog({ tableName: "employees", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toEmployee(existing), newData: toEmployee(updated) }, client); await client.query("COMMIT"); res.json(toEmployee(updated)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function deleteEmployee(req, res, next) {
  try { await ensureReady(); const existing = await getEmployeeRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); await assertEmployeeDeleteAllowed(existing.id); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query("DELETE FROM employees WHERE id = $1", [existing.id]); await writeAuditLog({ tableName: "employees", rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toEmployee(existing), newData: null }, client); await client.query("COMMIT"); res.json({ ok: true }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}
