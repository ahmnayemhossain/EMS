import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

const allowed = {
  departments: { label: "Department" },
  designations: { label: "Designation" },
  uom: { label: "UOM" },
  suppliers: { label: "Supplier" },
};

export function createReferenceSettingsRouter(tableName) {
  const config = allowed[tableName];
  if (!config) throw new Error(`Unsupported reference table: ${tableName}`);

  const router = Router();
  let readyPromise;
  const ensureReady = () => {
    if (!readyPromise) readyPromise = ensureCoreSchema();
    return readyPromise;
  };

  function toDateTime(value) {
    return value?.toISOString?.() || value || undefined;
  }

  function toItem(row) {
    return {
      id: String(row.id),
      name: row.name,
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
    const name = String(input.name || "").trim();
    if (!name) throw new Error(`${config.label} name is required.`);

    const status = Number(input.status ?? input.isActive ?? 1);
    if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");

    return { name, status };
  }

  const selectSql = `
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

  async function getRow(id, db = { query }) {
    const result = await db.query(`${selectSql} WHERE t.id::text = $1`, [String(id)]);
    return result.rows[0] || null;
  }

  router.get("/", requirePermission(`settings:${tableName}:read`), async (_req, res, next) => {
    try {
      await ensureReady();
      const result = await query(`${selectSql} ORDER BY t.name ASC`);
      res.json(result.rows.map(toItem));
    } catch (error) {
      next(error);
    }
  });

  router.post("/", requirePermission(`settings:${tableName}:write`), async (req, res, next) => {
    try {
      await ensureReady();
      const item = normalizeInput(req.body || {});
      const actor = await getRequestActor(req);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `
            INSERT INTO ${tableName} (name, is_active, created_by_user_id, updated_by_user_id)
            VALUES ($1, $2, $3, $3)
            RETURNING id
          `,
          [item.name, item.status, actor.id],
        );
        const created = await getRow(result.rows[0].id, client);
        await writeAuditLog(
          {
            tableName,
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
  });

  router.put("/:id", requirePermission(`settings:${tableName}:update`), async (req, res, next) => {
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
          `
            UPDATE ${tableName}
            SET name = $2,
                is_active = $3,
                updated_by_user_id = $4,
                updated_at = NOW()
            WHERE id = $1
          `,
          [existing.id, item.name, item.status, actor.id],
        );
        const updated = await getRow(existing.id, client);
        await writeAuditLog(
          {
            tableName,
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
  });

  router.delete("/:id", requirePermission(`settings:${tableName}:delete`), async (req, res, next) => {
    try {
      await ensureReady();
      const existing = await getRow(req.params.id);
      if (!existing) return res.status(404).json({ error: "not_found" });
      const actor = await getRequestActor(req);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [existing.id]);
        await writeAuditLog(
          {
            tableName,
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
  });

  return router;
}
