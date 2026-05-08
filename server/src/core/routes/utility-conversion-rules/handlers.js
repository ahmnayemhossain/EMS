import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { pool, query } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";

function toItem(row) {
  return {
    id: String(row.id),
    companyId: row.company_id ? String(row.company_id) : null,
    key: row.key,
    value: Number(row.value),
    isActive: Number(row.is_active) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getRowByKey({ companyId, key }, db = { query }) {
  const result = await db.query(
    `SELECT * FROM utility_conversion_rules WHERE key = $1 AND company_id IS NOT DISTINCT FROM $2 LIMIT 1`,
    [key, companyId ?? null],
  );
  return result.rows[0] || null;
}

export async function listUtilityConversionRules(req, res, next) {
  try {
    await ensureCoreSchema();
    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    const params = [];
    const where = [];
    if (companyId) {
      params.push(companyId);
      where.push(`company_id::text = $${params.length}`);
    }
    const result = await query(
      `SELECT * FROM utility_conversion_rules ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY key ASC`,
      params,
    );
    res.json(result.rows.map(toItem));
  } catch (error) {
    next(error);
  }
}

export async function upsertUtilityConversionRule(req, res, next) {
  try {
    await ensureCoreSchema();
    const key = String(req.body?.key || "").trim();
    const value = Number(req.body?.value);
    const companyId = req.body?.companyId ? String(req.body.companyId).trim() : null;
    const isActive = req.body?.isActive === 0 || req.body?.isActive === false ? 0 : 1;

    if (!key) return res.status(400).json({ error: "key_required" });
    if (!Number.isFinite(value) || value <= 0) return res.status(400).json({ error: "value_invalid" });

    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const existing = await getRowByKey({ companyId, key }, client);
      const result = await client.query(
        `
          INSERT INTO utility_conversion_rules (company_id, key, value, is_active, created_by_user_id, updated_by_user_id)
          VALUES ($1,$2,$3,$4,$5,$5)
          ON CONFLICT (company_id, key) DO UPDATE
            SET value = EXCLUDED.value,
                is_active = EXCLUDED.is_active,
                updated_by_user_id = EXCLUDED.updated_by_user_id,
                updated_at = NOW()
          RETURNING id
        `,
        [companyId, key, value, isActive, actor.id],
      );
      const updated = await client.query(`SELECT * FROM utility_conversion_rules WHERE id = $1`, [result.rows[0].id]);
      await writeAuditLog(
        { tableName: "utility_conversion_rules", rowId: result.rows[0].id, action: existing ? "update" : "create", actorUserId: actor.id, oldData: existing ? toItem(existing) : null, newData: toItem(updated.rows[0]) },
        client,
      );
      await client.query("COMMIT");
      res.json(toItem(updated.rows[0]));
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

