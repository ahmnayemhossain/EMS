import { query } from "../postgres.js";

export async function getCompanyIdByValue(value) {
  return getIdByNumericValue("companies", value);
}

export async function getFacilityIdByValue(value) {
  return getCompanyIdByValue(value);
}

export async function getUserIdByValue(value) {
  const raw = String(value || "").trim();
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    const byId = await getIdByNumericValue("users", numeric);
    if (byId) return byId;
  }
  const legacyUsernames = { userone: "1001", usertwo: "1002", userthree: "1003", userfour: "1004", userfive: "1005", usersix: "1006", userseven: "1007" };
  const username = legacyUsernames[raw] || (raw.startsWith("usr_") ? raw.slice(4) : raw);
  if (!username) return null;
  const result = await query("SELECT id FROM users WHERE username = $1", [username]);
  return result.rows[0]?.id ?? null;
}

export async function getIdByName(table, name) {
  const result = await query(`SELECT id FROM ${table} WHERE name = $1`, [name]);
  return result.rows[0]?.id ?? null;
}

export async function getIdByKey(table, key) {
  const result = await query(`SELECT id FROM ${table} WHERE key = $1`, [key]);
  return result.rows[0]?.id ?? null;
}

export async function getEmployeeIdByEmployeeId(employeeId) {
  const result = await query("SELECT id FROM employees WHERE employee_id = $1", [employeeId]);
  return result.rows[0]?.id ?? null;
}

async function getIdByNumericValue(table, value) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) return null;
  const result = await query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0]?.id ?? null;
}
