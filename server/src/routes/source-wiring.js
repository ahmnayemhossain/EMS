import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { assertSourceWiringDeleteAllowed } from "../shared/delete-guards.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

export const sourceWiringRouter = Router();

let readyPromise;

function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

function toWiring(row) {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    sourceName: row.source_name,
    utilityTypeId: String(row.utility_type_id),
    utilityTypeKey: row.utility_type_key,
    utilityTypeName: row.utility_type_name,
    status: Number(row.is_active ?? 1),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: toDateTime(row.created_at),
    updatedAt: toDateTime(row.updated_at),
  };
}

function normalizeInput(input) {
  const sourceId = String(input.sourceId || "").trim();
  const utilityTypeId = String(input.utilityTypeId || "").trim();
  const status = Number(input.status ?? input.isActive ?? 1);

  if (!sourceId) throw new Error("Source is required.");
  if (!utilityTypeId) throw new Error("Utility type is required.");
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");

  return { sourceId, utilityTypeId, status };
}

const selectSql = `
  SELECT
    sw.*,
    s.name AS source_name,
    ut.key AS utility_type_key,
    ut.name AS utility_type_name,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM source_wiring sw
  JOIN sources s ON s.id = sw.source_id
  JOIN utility_types ut ON ut.id = sw.utility_type_id
  LEFT JOIN users cu ON cu.id = sw.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = sw.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

async function getWiringRow(id, db = { query }) {
  const result = await db.query(`${selectSql} WHERE sw.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}

async function getOptionSets() {
  const [sourceResult, utilityTypeResult] = await Promise.all([
    query(`SELECT id::text AS id, name FROM sources WHERE is_active = 1 ORDER BY name ASC`),
    query(`SELECT id::text AS id, key, name FROM utility_types WHERE is_active = 1 ORDER BY name ASC`),
  ]);

  return {
    sourceOptions: sourceResult.rows,
    utilityTypeOptions: utilityTypeResult.rows,
  };
}

sourceWiringRouter.get("/lookups/options", requirePermission("settings:source-wiring:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    res.json(await getOptionSets());
  } catch (error) {
    next(error);
  }
});

sourceWiringRouter.get("/", requirePermission("settings:source-wiring:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    const result = await query(`${selectSql} ORDER BY ut.name ASC, s.name ASC`);
    res.json(result.rows.map(toWiring));
  } catch (error) {
    next(error);
  }
});

sourceWiringRouter.post("/", requirePermission("settings:source-wiring:write"), async (req, res, next) => {
  try {
    await ensureReady();
    const item = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `
          INSERT INTO source_wiring (source_id, utility_type_id, is_active, created_by_user_id, updated_by_user_id)
          VALUES ($1, $2, $3, $4, $4)
          RETURNING id
        `,
        [item.sourceId, item.utilityTypeId, item.status, actor.id],
      );
      const created = await getWiringRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: "source_wiring",
          rowId: result.rows[0].id,
          action: "create",
          actorUserId: actor.id,
          oldData: null,
          newData: toWiring(created),
        },
        client,
      );
      await client.query("COMMIT");
      res.status(201).json(toWiring(created));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

sourceWiringRouter.put("/:id", requirePermission("settings:source-wiring:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getWiringRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const item = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `
          UPDATE source_wiring
          SET source_id = $2,
              utility_type_id = $3,
              is_active = $4,
              updated_by_user_id = $5,
              updated_at = NOW()
          WHERE id = $1
        `,
        [existing.id, item.sourceId, item.utilityTypeId, item.status, actor.id],
      );
      const updated = await getWiringRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: "source_wiring",
          rowId: existing.id,
          action: "update",
          actorUserId: actor.id,
          oldData: toWiring(existing),
          newData: toWiring(updated),
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toWiring(updated));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

sourceWiringRouter.delete("/:id", requirePermission("settings:source-wiring:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getWiringRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    await assertSourceWiringDeleteAllowed(existing.id);
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM source_wiring WHERE id = $1`, [existing.id]);
      await writeAuditLog(
        {
          tableName: "source_wiring",
          rowId: existing.id,
          action: "delete",
          actorUserId: actor.id,
          oldData: toWiring(existing),
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
});
