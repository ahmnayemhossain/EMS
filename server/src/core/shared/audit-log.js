import { query } from "./postgres.js";
import { getRequestUserValue, getUserIdByValue } from "./schema.js";

export async function getRequestActor(req) {
  const value = getRequestUserValue(req);
  const id = await getUserIdByValue(value);

  return { id, value };
}

export async function writeAuditLog({ tableName, rowId, action, actorUserId, oldData, newData }, db = { query }) {
  await db.query(
    `
      INSERT INTO audit_logs (
        table_name, row_id, action, actor_user_id, old_data, new_data
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
    `,
    [
      tableName,
      String(rowId),
      action,
      actorUserId || null,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
    ],
  );
}
