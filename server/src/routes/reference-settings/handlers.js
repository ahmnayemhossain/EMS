import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { assertReferenceDeleteAllowed } from "../../shared/delete-guards.js";
import { pool, query } from "../../shared/postgres.js";
import { getRow, getSelectSql } from "./db.js";
import { ensureReady, normalizeInput, toItem } from "./helpers.js";

export function listItems(tableName) {
  return async (_req, res, next) => {
    try { await ensureReady(); const result = await query(`${getSelectSql(tableName)} ORDER BY t.name ASC`); res.json(result.rows.map(toItem)); } catch (error) { next(error); }
  };
}

export function createItem(tableName, label) {
  return async (req, res, next) => {
    try { await ensureReady(); const item = normalizeInput(req.body || {}, label); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); const result = await client.query(`INSERT INTO ${tableName} (name, is_active, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $3) RETURNING id`, [item.name, item.status, actor.id]); const created = await getRow(tableName, result.rows[0].id, client); await writeAuditLog({ tableName, rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toItem(created) }, client); await client.query("COMMIT"); res.status(201).json(toItem(created)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
  };
}

export function updateItem(tableName, label) {
  return async (req, res, next) => {
    try { await ensureReady(); const existing = await getRow(tableName, req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const item = normalizeInput(req.body || {}, label); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`UPDATE ${tableName} SET name = $2, is_active = $3, updated_by_user_id = $4, updated_at = NOW() WHERE id = $1`, [existing.id, item.name, item.status, actor.id]); const updated = await getRow(tableName, existing.id, client); await writeAuditLog({ tableName, rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toItem(existing), newData: toItem(updated) }, client); await client.query("COMMIT"); res.json(toItem(updated)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
  };
}

export function deleteItem(tableName, label) {
  return async (req, res, next) => {
    try { await ensureReady(); const existing = await getRow(tableName, req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); await assertReferenceDeleteAllowed(tableName, existing.id, label); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [existing.id]); await writeAuditLog({ tableName, rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toItem(existing), newData: null }, client); await client.query("COMMIT"); res.json({ ok: true }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
  };
}
