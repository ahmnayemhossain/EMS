import { query } from "../../shared/postgres.js";

export function getSelectSql(config) {
  return `
    SELECT
      w.*,
      s.name AS source_name,
      ut.key AS utility_type_key,
      ut.name AS utility_type_name,
      COALESCE(ce.name, cu.username) AS created_by_user_name,
      COALESCE(ue.name, uu.username) AS updated_by_user_name
    FROM ${config.tableName} w
    JOIN ${config.sourceTable} s ON s.id = w.${config.sourceColumn}
    JOIN utility_types ut ON ut.id = w.utility_type_id
    LEFT JOIN users cu ON cu.id = w.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    LEFT JOIN users uu ON uu.id = w.updated_by_user_id
    LEFT JOIN employees ue ON ue.id = uu.employee_id
  `;
}

export async function getWiringRow(config, id, db = { query }) {
  const result = await db.query(`${getSelectSql(config)} WHERE w.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}
