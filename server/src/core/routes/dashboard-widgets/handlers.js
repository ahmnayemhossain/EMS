import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { assertReferenceDeleteAllowed } from "../../shared/delete-guards.js";
import { pool, query } from "../../shared/postgres.js";
import { ensureReady } from "../reference-settings/helpers.js";

const TABLE_NAME = "dashboard_widgets";
const TEMPLATE_KEYS = new Set([
  "utility_overview",
  "utility_trend",
  "utility_approval_queue",
  "company_snapshot",
  "audit_calendar",
]);

const SELECT_SQL = `
  SELECT
    t.*,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM dashboard_widgets t
  LEFT JOIN users cu ON cu.id = t.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = t.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

export async function listDashboardWidgets(_req, res, next) {
  try {
    await ensureReady();
    const result = await query(`${SELECT_SQL} ORDER BY t.name ASC`);
    res.json(result.rows.map(toItem));
  } catch (error) {
    next(error);
  }
}

export async function createDashboardWidget(req, res, next) {
  try {
    await ensureReady();
    const item = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO dashboard_widgets (
          name,
          template_key,
          description,
          default_span,
          default_rows,
          is_active,
          created_by_user_id,
          updated_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id`,
        [
          item.name,
          item.templateKey,
          item.description,
          item.defaultSpan,
          item.defaultRows,
          item.status,
          actor.id,
        ],
      );
      const created = await getRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: TABLE_NAME,
          rowId: result.rows[0].id,
          action: "create",
          actorUserId: actor.id,
          oldData: null,
          newData: toItem(created),
        },
        client,
      );
      await client.query("COMMIT");
      res.status(201).json(toItem(created));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

export async function updateDashboardWidget(req, res, next) {
  try {
    await ensureReady();
    const existing = await getRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const item = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE dashboard_widgets
         SET name = $2,
             template_key = $3,
             description = $4,
             default_span = $5,
             default_rows = $6,
             is_active = $7,
             updated_by_user_id = $8,
             updated_at = NOW()
         WHERE id = $1`,
        [
          existing.id,
          item.name,
          item.templateKey,
          item.description,
          item.defaultSpan,
          item.defaultRows,
          item.status,
          actor.id,
        ],
      );
      const updated = await getRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: TABLE_NAME,
          rowId: existing.id,
          action: "update",
          actorUserId: actor.id,
          oldData: toItem(existing),
          newData: toItem(updated),
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toItem(updated));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

export async function deleteDashboardWidget(req, res, next) {
  try {
    await ensureReady();
    const existing = await getRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    await assertReferenceDeleteAllowed(TABLE_NAME, existing.id, "Dashboard widget");
    const actor = await getRequestActor(req);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM dashboard_widgets WHERE id = $1`, [existing.id]);
      await writeAuditLog(
        {
          tableName: TABLE_NAME,
          rowId: existing.id,
          action: "delete",
          actorUserId: actor.id,
          oldData: toItem(existing),
          newData: null,
        },
        client,
      );
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

async function getRow(id, db = { query }) {
  const result = await db.query(`${SELECT_SQL} WHERE t.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}

function normalizeInput(input) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Widget name is required.");

  const templateKey = String(input.templateKey || "").trim();
  if (!TEMPLATE_KEYS.has(templateKey)) {
    throw new Error("Select a valid widget preset.");
  }

  const description = String(input.description || "").trim();
  const defaultSpan = clampNumber(input.defaultSpan, 1, 6, 6);
  const defaultRows = clampNumber(input.defaultRows, 1, 12, 3);
  const status = Number(input.status) === 0 ? 0 : 1;

  return {
    name,
    templateKey,
    description,
    defaultSpan,
    defaultRows,
    status,
  };
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function toItem(row) {
  return {
    id: String(row.id),
    name: row.name,
    templateKey: row.template_key,
    description: row.description || "",
    defaultSpan: Number(row.default_span || 6),
    defaultRows: Number(row.default_rows || 3),
    status: Number(row.is_active) === 0 ? 0 : 1,
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}
