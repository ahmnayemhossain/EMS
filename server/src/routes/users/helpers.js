import { hashPassword } from "../../shared/auth.js";
import { query } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";

let readyPromise;

export function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await ensureCoreSchema();
      await query(`CREATE TABLE IF NOT EXISTS user_companies (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, company_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE, UNIQUE (user_id, company_id)); INSERT INTO user_companies (user_id, company_id) SELECT u.id, e.company_id FROM users u JOIN employees e ON e.id = u.employee_id WHERE e.company_id IS NOT NULL ON CONFLICT (user_id, company_id) DO NOTHING;`);
    })();
  }
  return readyPromise;
}

export function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

export function toUser(row) {
  return { id: String(row.id), employeeDbId: row.employee_db_id ? String(row.employee_db_id) : undefined, employeeId: Number(row.employee_number), employeeName: row.employee_name || undefined, companyId: row.company_id ? String(row.company_id) : undefined, companyName: row.company_name || undefined, username: row.username, email: row.email, roleIds: Array.isArray(row.role_ids) ? row.role_ids.map(String) : [], companyAccessIds: Array.isArray(row.company_access_ids) ? row.company_access_ids.map(String) : [], status: row.status, lastLoginAt: toDateTime(row.last_login_at), createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined, createdByUserName: row.created_by_user_name || undefined, updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined, updatedByUserName: row.updated_by_user_name || undefined, createdAt: toDateTime(row.created_at), updatedAt: toDateTime(row.updated_at) };
}

export function normalizeUserInput(input) {
  const employeeDbId = Number(input.employeeDbId || input.employeeId);
  if (!Number.isFinite(employeeDbId) || employeeDbId <= 0) throw new Error("Employee is required.");
  const roleIds = Array.isArray(input.roleIds) ? input.roleIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0) : [];
  if (!roleIds.length) throw new Error("At least one role is required.");
  const companyAccessIds = Array.isArray(input.companyAccessIds) ? input.companyAccessIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0) : [];
  if (!companyAccessIds.length) throw new Error("At least one company access is required.");
  const status = String(input.status || "active");
  if (!["active", "suspended"].includes(status)) throw new Error("Invalid user status.");
  return { employeeDbId, roleIds, companyAccessIds, status };
}

export async function employeeDbIdFromInput(value) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) return null;
  const result = await query("SELECT id FROM employees WHERE id = $1", [id]);
  if (result.rows[0]?.id) return result.rows[0].id;
  const byEmployeeNumber = await query("SELECT id FROM employees WHERE employee_id = $1", [id]);
  return byEmployeeNumber.rows[0]?.id ?? null;
}

export async function assertRolesExist(roleIds) {
  const result = await query("SELECT id FROM roles WHERE id = ANY($1::bigint[])", [roleIds]);
  if (result.rowCount !== roleIds.length) throw new Error("Invalid role.");
}

export async function assertCompaniesExist(companyIds) {
  const result = await query("SELECT id FROM companies WHERE id = ANY($1::bigint[])", [companyIds]);
  if (result.rowCount !== companyIds.length) throw new Error("Invalid company access.");
}

export function initialPasswordForEmployee(employee) {
  return hashPassword(String(employee.employee_id));
}
