import { query } from "../../shared/postgres.js";
import { selectCompanySql } from "./queries.js";

export async function getCompanyRow(id, db = { query }) {
  const result = await db.query(`${selectCompanySql} WHERE f.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}
