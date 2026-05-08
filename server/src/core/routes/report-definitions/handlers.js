import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { pool, query } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";

import { assertVariablesValid, normalizeReportDefinitionInput } from "./helpers.js";

function toItem(row) {
  return {
    id: String(row.id),
    key: row.key,
    name: row.name,
    description: row.description || "",
    requiresCompany: Number(row.requires_company) === 1,
    sqlText: row.sql_text,
    variables: Array.isArray(row.variables) ? row.variables : [],
    isActive: Number(row.is_active) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getRow(id, db = { query }) {
  const result = await db.query(`SELECT * FROM report_definitions WHERE id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}

export async function listReportDefinitions(req, res, next) {
  try {
    await ensureCoreSchema();
    const result = await query(
      `SELECT * FROM report_definitions ORDER BY name ASC`,
    );
    res.json(result.rows.map(toItem));
  } catch (error) {
    next(error);
  }
}

export async function createReportDefinition(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeReportDefinitionInput(req.body || {});
    assertVariablesValid(input.variables);
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `
          INSERT INTO report_definitions
            (key, name, description, requires_company, sql_text, variables, is_active, created_by_user_id, updated_by_user_id)
          VALUES
            ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$8)
          RETURNING id
        `,
        [
          input.key,
          input.name,
          input.description,
          input.requiresCompany,
          input.sqlText,
          JSON.stringify(input.variables),
          input.isActive,
          actor.id,
        ],
      );
      const created = await getRow(inserted.rows[0].id, client);
      await writeAuditLog(
        { tableName: "report_definitions", rowId: inserted.rows[0].id, action: "create", actorUserId: actor.id, oldData: null, newData: toItem(created) },
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

export async function updateReportDefinition(req, res, next) {
  try {
    await ensureCoreSchema();
    const existing = await getRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const input = normalizeReportDefinitionInput(req.body || {});
    assertVariablesValid(input.variables);
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(
        `
          UPDATE report_definitions
          SET key = $2,
              name = $3,
              description = $4,
              requires_company = $5,
              sql_text = $6,
              variables = $7::jsonb,
              is_active = $8,
              updated_by_user_id = $9,
              updated_at = NOW()
          WHERE id = $1
        `,
        [
          existing.id,
          input.key,
          input.name,
          input.description,
          input.requiresCompany,
          input.sqlText,
          JSON.stringify(input.variables),
          input.isActive,
          actor.id,
        ],
      );
      const updated = await getRow(existing.id, client);
      await writeAuditLog(
        { tableName: "report_definitions", rowId: existing.id, action: "update", actorUserId: actor.id, oldData: toItem(existing), newData: toItem(updated) },
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

export async function deleteReportDefinition(req, res, next) {
  try {
    await ensureCoreSchema();
    const existing = await getRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM report_definitions WHERE id = $1`, [existing.id]);
      await writeAuditLog(
        { tableName: "report_definitions", rowId: existing.id, action: "delete", actorUserId: actor.id, oldData: toItem(existing), newData: null },
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

