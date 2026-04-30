import { query } from "../../shared/postgres.js";

export function getSelectSql(tableName) {
  return `
    SELECT
      t.*,
      COALESCE(ce.name, cu.username) AS created_by_user_name,
      COALESCE(ue.name, uu.username) AS updated_by_user_name
    FROM ${tableName} t
    LEFT JOIN users cu ON cu.id = t.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    LEFT JOIN users uu ON uu.id = t.updated_by_user_id
    LEFT JOIN employees ue ON ue.id = uu.employee_id
  `;
}

export async function getRow(tableName, id, db = { query }) {
  const result = await db.query(`${getSelectSql(tableName)} WHERE t.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}
