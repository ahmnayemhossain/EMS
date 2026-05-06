import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { pool, query } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";

import { assertMeterRefsValid, normalizeMeterInput } from "./helpers.js";

async function getMeterRow(id, db = { query }) {
  const result = await db.query(
    `
      SELECT
        m.*,
        c.name AS company_name,
        ut.key AS utility_type_key,
        ut.name AS utility_type_name,
        s.name AS source_name,
        u.name AS uom_name,
        COALESCE(ce.name, cu.username) AS created_by_user_name,
        COALESCE(ue.name, uu.username) AS updated_by_user_name
      FROM meters m
      JOIN companies c ON c.id = m.company_id
      JOIN utility_types ut ON ut.id = m.utility_type_id
      JOIN uom u ON u.id = m.uom_id
      LEFT JOIN sources s ON s.id = m.source_id
      LEFT JOIN users cu ON cu.id = m.created_by_user_id
      LEFT JOIN employees ce ON ce.id = cu.employee_id
      LEFT JOIN users uu ON uu.id = m.updated_by_user_id
      LEFT JOIN employees ue ON ue.id = uu.employee_id
      WHERE m.id::text = $1
    `,
    [String(id)],
  );
  return result.rows[0] || null;
}

function toItem(row) {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    companyName: row.company_name,
    utilityTypeId: String(row.utility_type_id),
    utilityType: row.utility_type_key,
    utilityTypeName: row.utility_type_name,
    name: row.name,
    code: row.code || undefined,
    location: row.location || undefined,
    sourceId: row.source_id ? String(row.source_id) : undefined,
    sourceName: row.source_name || undefined,
    uomId: String(row.uom_id),
    uom: row.uom_name,
    isActive: Number(row.is_active) === 1,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMeters(req, res, next) {
  try {
    await ensureCoreSchema();
    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    const typeId = req.query.utilityTypeId ? String(req.query.utilityTypeId).trim() : "";
    const params = [];
    const where = [];
    if (companyId) {
      params.push(companyId);
      where.push(`m.company_id::text = $${params.length}`);
    }
    if (typeId) {
      params.push(typeId);
      where.push(`m.utility_type_id::text = $${params.length}`);
    }

    const result = await query(
      `
        SELECT
          m.*,
          c.name AS company_name,
          ut.key AS utility_type_key,
          ut.name AS utility_type_name,
          s.name AS source_name,
          u.name AS uom_name,
          COALESCE(ce.name, cu.username) AS created_by_user_name,
          COALESCE(ue.name, uu.username) AS updated_by_user_name
        FROM meters m
        JOIN companies c ON c.id = m.company_id
        JOIN utility_types ut ON ut.id = m.utility_type_id
        JOIN uom u ON u.id = m.uom_id
        LEFT JOIN sources s ON s.id = m.source_id
        LEFT JOIN users cu ON cu.id = m.created_by_user_id
        LEFT JOIN employees ce ON ce.id = cu.employee_id
        LEFT JOIN users uu ON uu.id = m.updated_by_user_id
        LEFT JOIN employees ue ON ue.id = uu.employee_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY c.name ASC, ut.key ASC, m.name ASC
      `,
      params,
    );

    res.json(result.rows.map(toItem));
  } catch (error) {
    next(error);
  }
}

export async function createMeter(req, res, next) {
  try {
    await ensureCoreSchema();
    const meter = normalizeMeterInput(req.body || {});
    await assertMeterRefsValid(meter);
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO meters (name, code, location, company_id, utility_type_id, source_id, uom_id, is_active, created_by_user_id, updated_by_user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9) RETURNING id`,
        [meter.name, meter.code, meter.location, meter.companyId, meter.utilityTypeId, meter.sourceId, meter.uomId, meter.isActive, actor.id],
      );
      const created = await getMeterRow(result.rows[0].id, client);
      await writeAuditLog(
        { tableName: "meters", rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toItem(created) },
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

export async function updateMeter(req, res, next) {
  try {
    await ensureCoreSchema();
    const existing = await getMeterRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const meter = normalizeMeterInput(req.body || {});
    await assertMeterRefsValid(meter);
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE meters SET name = $2, code = $3, location = $4, company_id = $5, utility_type_id = $6, source_id = $7, uom_id = $8, is_active = $9, updated_by_user_id = $10, updated_at = NOW() WHERE id = $1`,
        [existing.id, meter.name, meter.code, meter.location, meter.companyId, meter.utilityTypeId, meter.sourceId, meter.uomId, meter.isActive, actor.id],
      );
      const updated = await getMeterRow(existing.id, client);
      await writeAuditLog(
        { tableName: "meters", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toItem(existing), newData: toItem(updated) },
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

export async function deleteMeter(req, res, next) {
  try {
    await ensureCoreSchema();
    const existing = await getMeterRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM meters WHERE id = $1", [existing.id]);
      await writeAuditLog(
        { tableName: "meters", rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toItem(existing), newData: null },
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

