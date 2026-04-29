import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { pool, query } from "../../shared/postgres.js";
import { getWiringRow, getSelectSql } from "./db.js";
import { ensureReady, normalizeInput, toDateTime } from "./helpers.js";

function toWiring(config, row) {
  return {
    id: String(row.id), [config.sourceIdKey]: String(row[config.sourceIdField]),
    [config.sourceNameKey]: row.source_name, utilityTypeId: String(row.utility_type_id),
    utilityTypeKey: row.utility_type_key, utilityTypeName: row.utility_type_name,
    status: Number(row.is_active ?? 1),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: toDateTime(row.created_at), updatedAt: toDateTime(row.updated_at),
  };
}

export function listOptions(config) {
  return async (_req, res, next) => {
    try { await ensureReady(); const [sourceResult, utilityTypeResult] = await Promise.all([query(`SELECT id::text AS id, name FROM ${config.sourceTable} WHERE is_active = 1 ORDER BY name ASC`), query("SELECT id::text AS id, key, name FROM utility_types WHERE is_active = 1 ORDER BY name ASC")]); res.json({ [config.sourceOptionsKey]: sourceResult.rows, utilityTypeOptions: utilityTypeResult.rows }); } catch (error) { next(error); }
  };
}

export function listItems(config) {
  return async (_req, res, next) => {
    try { await ensureReady(); const result = await query(`${getSelectSql(config)} ORDER BY ut.name ASC, s.name ASC`); res.json(result.rows.map((row) => toWiring(config, row))); } catch (error) { next(error); }
  };
}

export function createItem(config) {
  return async (req, res, next) => {
    try { await ensureReady(); const item = normalizeInput(req.body || {}, config.sourceLabel); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); const result = await client.query(`INSERT INTO ${config.tableName} (${config.sourceColumn}, utility_type_id, is_active, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $4) RETURNING id`, [item.sourceId, item.utilityTypeId, item.status, actor.id]); const created = await getWiringRow(config, result.rows[0].id, client); await writeAuditLog({ tableName: config.tableName, rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toWiring(config, created) }, client); await client.query("COMMIT"); res.status(201).json(toWiring(config, created)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
  };
}

export function updateItem(config) {
  return async (req, res, next) => {
    try { await ensureReady(); const existing = await getWiringRow(config, req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const item = normalizeInput(req.body || {}, config.sourceLabel); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`UPDATE ${config.tableName} SET ${config.sourceColumn} = $2, utility_type_id = $3, is_active = $4, updated_by_user_id = $5, updated_at = NOW() WHERE id = $1`, [existing.id, item.sourceId, item.utilityTypeId, item.status, actor.id]); const updated = await getWiringRow(config, existing.id, client); await writeAuditLog({ tableName: config.tableName, rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toWiring(config, existing), newData: toWiring(config, updated) }, client); await client.query("COMMIT"); res.json(toWiring(config, updated)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
  };
}

export function deleteItem(config) {
  return async (req, res, next) => {
    try { await ensureReady(); const existing = await getWiringRow(config, req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); await config.assertDeleteAllowed(existing.id); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`DELETE FROM ${config.tableName} WHERE id = $1`, [existing.id]); await writeAuditLog({ tableName: config.tableName, rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toWiring(config, existing), newData: null }, client); await client.query("COMMIT"); res.json({ ok: true }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
  };
}
