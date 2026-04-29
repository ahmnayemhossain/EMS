import { query } from "../../shared/postgres.js";
import { selectUserSql } from "./queries.js";

export async function getEmployeeForUser(employeeDbId, db = { query }) {
  const result = await db.query("SELECT id, employee_id, email FROM employees WHERE id = $1", [employeeDbId]);
  return result.rows[0] || null;
}

export async function replaceUserRoles(client, userId, roleIds) {
  await client.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
  for (const roleId of roleIds) await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING`, [userId, roleId]);
}

export async function replaceUserCompanies(client, userId, companyIds) {
  await client.query("DELETE FROM user_companies WHERE user_id = $1", [userId]);
  for (const companyId of companyIds) await client.query(`INSERT INTO user_companies (user_id, company_id) VALUES ($1, $2) ON CONFLICT (user_id, company_id) DO NOTHING`, [userId, companyId]);
}

export async function getUserRow(id, db = { query }) {
  const result = await db.query(`${selectUserSql} WHERE u.id::text = $1 GROUP BY u.id, e.id, f.id, ce.id, cu.id, ue.id, uu.id`, [String(id)]);
  return result.rows[0] || null;
}
