import { query } from "../../shared/postgres.js";
import { selectEmployeeSql } from "./queries.js";

export async function getIdByValueOrThrow(table, value, label) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  const result = await query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  if (!result.rows[0]?.id) throw new Error(`Invalid ${label}.`);
  return result.rows[0].id;
}

export async function getEmployeeRow(id, db = { query }) {
  const result = await db.query(`${selectEmployeeSql} WHERE e.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}
