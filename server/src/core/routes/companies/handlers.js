import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { assertCompanyDeleteAllowed } from "../../shared/delete-guards.js";
import { pool, query } from "../../shared/postgres.js";
import { getRequestUserValue, getUserIdByValue } from "../../shared/schema.js";
import { getCompanyRow } from "./db.js";
import { ensureReady, normalizeInput, toCompany } from "./helpers.js";
import { selectCompanySql } from "./queries.js";

export async function listCompanies(_req, res, next) {
  try { await ensureReady(); const result = await query(`${selectCompanySql} ORDER BY f.name ASC`); res.json(result.rows.map(toCompany)); } catch (error) { next(error); }
}

export async function listCompanyOptions(req, res, next) {
  try { await ensureReady(); const userId = await getUserIdByValue(getRequestUserValue(req)); const result = await query(`SELECT f.id::text AS id, f.name, f.short_name AS "shortName", f.local_name AS "localName", f.address FROM companies f LEFT JOIN user_companies uf ON uf.company_id = f.id AND uf.user_id = $1 WHERE ($1::bigint IS NULL OR uf.user_id IS NOT NULL) AND f.is_active = 1 ORDER BY f.name ASC`, [userId]); res.json(result.rows); } catch (error) { next(error); }
}

export async function getCompany(req, res, next) {
  try { await ensureReady(); const row = await getCompanyRow(req.params.id); if (!row) return res.status(404).json({ error: "not_found" }); res.json(toCompany(row)); } catch (error) { next(error); }
}

export async function createCompany(req, res, next) {
  try { await ensureReady(); const company = normalizeInput(req.body || {}); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); const result = await client.query(`INSERT INTO companies (name, short_name, local_name, address, is_active, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`, [company.name, company.shortName, company.localName, company.address, company.status, actor.id]); const created = await getCompanyRow(result.rows[0].id, client); await writeAuditLog({ tableName: "companies", rowId: result.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toCompany(created) }, client); await client.query("COMMIT"); res.status(201).json(toCompany(created)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function updateCompany(req, res, next) {
  try { await ensureReady(); const existing = await getCompanyRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); const company = normalizeInput(req.body || {}); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query(`UPDATE companies SET name = $2, short_name = $3, local_name = $4, address = $5, is_active = $6, updated_by_user_id = $7, updated_at = NOW() WHERE id = $1`, [existing.id, company.name, company.shortName, company.localName, company.address, company.status, actor.id]); const updated = await getCompanyRow(existing.id, client); await writeAuditLog({ tableName: "companies", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toCompany(existing), newData: toCompany(updated) }, client); await client.query("COMMIT"); res.json(toCompany(updated)); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}

export async function deleteCompany(req, res, next) {
  try { await ensureReady(); const existing = await getCompanyRow(req.params.id); if (!existing) return res.status(404).json({ error: "not_found" }); await assertCompanyDeleteAllowed(existing.id); const actor = await getRequestActor(req); const client = await pool.connect(); try { await client.query("BEGIN"); await client.query("DELETE FROM companies WHERE id = $1", [existing.id]); await writeAuditLog({ tableName: "companies", rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toCompany(existing), newData: null }, client); await client.query("COMMIT"); res.json({ ok: true }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } catch (error) { next(error); }
}
