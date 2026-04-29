import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { assertUomWiringDeleteAllowed } from "../shared/delete-guards.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

export const uomWiringRouter = Router();

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
    uomId: String(row.uom_id),
    uomName: row.uom_name,
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
  const uomId = String(input.uomId || "").trim();
  const utilityTypeId = String(input.utilityTypeId || "").trim();
  const status = Number(input.status ?? input.isActive ?? 1);

  if (!uomId) throw new Error("UOM is required.");
  if (!utilityTypeId) throw new Error("Utility type is required.");
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");

  return { uomId, utilityTypeId, status };
}

const selectSql = `
  SELECT
    uw.*,
    u.name AS uom_name,
    ut.key AS utility_type_key,
    ut.name AS utility_type_name,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM uom_wiring uw
  JOIN uom u ON u.id = uw.uom_id
  JOIN utility_types ut ON ut.id = uw.utility_type_id
  LEFT JOIN users cu ON cu.id = uw.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = uw.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

async function getWiringRow(id, db = { query }) {
  const result = await db.query(`${selectSql} WHERE uw.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}

async function getOptionSets() {
  const [uomResult, utilityTypeResult] = await Promise.all([
    query(`SELECT id::text AS id, name FROM uom WHERE is_active = 1 ORDER BY name ASC`),
    query(`SELECT id::text AS id, key, name FROM utility_types WHERE is_active = 1 ORDER BY name ASC`),
  ]);

  return {
    uomOptions: uomResult.rows,
    utilityTypeOptions: utilityTypeResult.rows,
  };
}

uomWiringRouter.get("/lookups/options", requirePermission("settings:uom-wiring:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    res.json(await getOptionSets());
  } catch (error) {
    next(error);
  }
});

uomWiringRouter.get("/", requirePermission("settings:uom-wiring:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    const result = await query(`${selectSql} ORDER BY ut.name ASC, u.name ASC`);
    res.json(result.rows.map(toWiring));
  } catch (error) {
    next(error);
  }
});

uomWiringRouter.post("/", requirePermission("settings:uom-wiring:write"), async (req, res, next) => {
  try {
    await ensureReady();
    const item = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `
          INSERT INTO uom_wiring (uom_id, utility_type_id, is_active, created_by_user_id, updated_by_user_id)
          VALUES ($1, $2, $3, $4, $4)
          RETURNING id
        `,
        [item.uomId, item.utilityTypeId, item.status, actor.id],
      );
      const created = await getWiringRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: "uom_wiring",
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

uomWiringRouter.put("/:id", requirePermission("settings:uom-wiring:update"), async (req, res, next) => {
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
          UPDATE uom_wiring
          SET uom_id = $2,
              utility_type_id = $3,
              is_active = $4,
              updated_by_user_id = $5,
              updated_at = NOW()
          WHERE id = $1
        `,
        [existing.id, item.uomId, item.utilityTypeId, item.status, actor.id],
      );
      const updated = await getWiringRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: "uom_wiring",
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

uomWiringRouter.delete("/:id", requirePermission("settings:uom-wiring:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getWiringRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    await assertUomWiringDeleteAllowed(existing.id);
    const actor = await getRequestActor(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM uom_wiring WHERE id = $1`, [existing.id]);
      await writeAuditLog(
        {
          tableName: "uom_wiring",
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
