import { query } from "../../shared/postgres.js";
import { selectRoleSql } from "./queries.js";

export async function replaceRolePermissions(client, roleId, permissionKeys) {
  await client.query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);
  for (const permissionKey of permissionKeys) {
    await client.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT $1, id FROM permissions WHERE key = $2 ON CONFLICT (role_id, permission_id) DO NOTHING`, [roleId, permissionKey]);
  }
}

export async function getRoleRow(id, db = { query }) {
  const result = await db.query(`${selectRoleSql} WHERE r.id::text = $1 GROUP BY r.id, ce.id, cu.id, ue.id, uu.id`, [String(id)]);
  return result.rows[0] || null;
}
