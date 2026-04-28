import { Router } from "express";

import { ensureCoreSchema } from "../shared/schema.js";
import { query } from "../shared/postgres.js";

export const auditLogsRouter = Router();

function toAuditLog(row) {
  return {
    id: Number(row.id),
    tableName: row.table_name,
    rowId: row.row_id,
    action: row.action,
    actorUserId: row.actor_user_id ? String(row.actor_user_id) : undefined,
    actorUserName: row.actor_user_name || undefined,
    oldData: row.old_data || null,
    newData: row.new_data || null,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}

auditLogsRouter.get("/", async (req, res, next) => {
  try {
    await ensureCoreSchema();

    const filters = [];
    const params = [];

    if (req.query.tableName) {
      params.push(String(req.query.tableName));
      filters.push(`al.table_name = $${params.length}`);
    }

    if (req.query.rowId) {
      params.push(String(req.query.rowId));
      filters.push(`al.row_id = $${params.length}`);
    }

    if (req.query.action) {
      params.push(String(req.query.action));
      filters.push(`al.action = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await query(
      `
        SELECT
          al.*,
          COALESCE(e.name, u.username) AS actor_user_name
        FROM audit_logs al
        LEFT JOIN users u ON u.id = al.actor_user_id
        LEFT JOIN employees e ON e.id = u.employee_id
        ${where}
        ORDER BY al.created_at DESC
        LIMIT 200
      `,
      params,
    );

    res.json(result.rows.map(toAuditLog));
  } catch (error) {
    next(error);
  }
});
