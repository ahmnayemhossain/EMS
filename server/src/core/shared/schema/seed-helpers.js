import { query } from "../postgres.js";
import { getEmployeeIdByEmployeeId, getIdByKey, getIdByName, getUserIdByValue } from "./lookups.js";

export async function insertByName(table, values) {
  for (const [name] of values) {
    await query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name`, [name]);
  }
}

export async function insertWiring(table, leftKey, rightTable, rightValue, values) {
  for (const [key, name] of values) {
    await query(`INSERT INTO ${table} (${leftKey}, ${rightValue}) SELECT ut.id, ref.id FROM utility_types ut JOIN ${rightTable} ref ON ref.name = $2 WHERE ut.key = $1 ON CONFLICT (${rightValue}, ${leftKey}) DO NOTHING`, [key, name]);
  }
}

export async function assignAdminPermissions(permissionKeys) {
  const roleId = await getIdByName("roles", "Admin");
  for (const permissionKey of permissionKeys) {
    const permissionId = await getIdByKey("permissions", permissionKey);
    await query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT (role_id, permission_id) DO NOTHING`, [roleId, permissionId]);
  }
}

export async function upsertDefaultUsers(defaultUsers) {
  for (const [employeeId, username, email, status] of defaultUsers) {
    const employeeDbId = await getEmployeeIdByEmployeeId(employeeId);
    await upsertUser(employeeDbId, username, email, status);
  }
}

export async function assignUserRole(username, roleName) {
  const userId = await getUserIdByValue(username);
  const roleId = await getIdByName("roles", roleName);
  await query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING`, [userId, roleId]);
}

async function upsertUser(employeeDbId, username, email, status) {
  const { hashPassword } = await import("../auth.js");
  const passwordHash = hashPassword(username);
  await query(`UPDATE users SET employee_id = $1, username = $2, email = $3, status = $4, password_hash = COALESCE(password_hash, $5), updated_at = NOW() WHERE employee_id = $1 OR username = $2 OR email = $3`, [employeeDbId, username, email, status, passwordHash]);
  await query(`INSERT INTO users (employee_id, username, email, status, password_hash) SELECT $1, $2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = $1 OR username = $2 OR email = $3)`, [employeeDbId, username, email, status, passwordHash]);
}
