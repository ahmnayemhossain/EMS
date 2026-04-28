import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema, getRequestUserValue, getUserIdByValue } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

export const companiesRouter = Router();

function toCompany(row) {
  return {
    id: String(row.id),
    name: row.name,
    shortName: row.short_name || "",
    localName: row.local_name || "",
    address: row.address || "",
    status: Number(row.is_active ?? 1),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

function normalizeInput(input) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Company name is required.");

  const shortName = String(input.shortName || input.short_name || "").trim();
  if (!shortName) throw new Error("Short name is required.");

  const status = Number(input.status ?? input.isActive ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");

  return {
    name,
    shortName,
    localName: input.localName || input.local_name ? String(input.localName || input.local_name).trim() : null,
    address: input.address ? String(input.address).trim() : null,
    status,
  };
}

const selectCompanySql = `
  SELECT
    f.*,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM companies f
  LEFT JOIN users cu ON cu.id = f.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = f.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

async function getCompanyRow(id, db = { query }) {
  const result = await db.query(`${selectCompanySql} WHERE f.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}

companiesRouter.get("/", requirePermission("settings:companies:read"), async (_req, res, next) => {
  try {
    await ensureCoreSchema();
    const result = await query(`${selectCompanySql} ORDER BY f.name ASC`);
    res.json(result.rows.map(toCompany));
  } catch (error) {
    next(error);
  }
});

companiesRouter.get("/options", async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const userId = await getUserIdByValue(getRequestUserValue(req));

    const result = await query(
      `
        SELECT
          f.id::text AS id,
          f.name,
          f.short_name AS "shortName",
          f.local_name AS "localName",
          f.address
        FROM companies f
        LEFT JOIN user_companies uf ON uf.company_id = f.id AND uf.user_id = $1
        WHERE ($1::bigint IS NULL OR uf.user_id IS NOT NULL)
          AND f.is_active = 1
        ORDER BY f.name ASC
      `,
      [userId],
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

companiesRouter.get("/:id", requirePermission("settings:companies:read"), async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const row = await getCompanyRow(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(toCompany(row));
  } catch (error) {
    next(error);
  }
});

companiesRouter.post("/", requirePermission("settings:companies:write"), async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const company = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const result = await client.query(
        `
          INSERT INTO companies (
            name, short_name, local_name, address, is_active,
            created_by_user_id, updated_by_user_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $6)
          RETURNING id
        `,
        [company.name, company.shortName, company.localName, company.address, company.status, actor.id],
      );
      const created = await getCompanyRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: "companies",
          rowId: result.rows[0].id,
          action: "create",
          actorUserId: actor.id,
          oldData: null,
          newData: toCompany(created),
        },
        client,
      );
      await client.query("COMMIT");
      res.status(201).json(toCompany(created));
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

companiesRouter.put("/:id", requirePermission("settings:companies:update"), async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const existing = await getCompanyRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const company = normalizeInput(req.body || {});
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(
        `
          UPDATE companies
          SET name = $2,
              short_name = $3,
              local_name = $4,
              address = $5,
              is_active = $6,
              updated_by_user_id = $7,
              updated_at = NOW()
          WHERE id = $1
        `,
        [existing.id, company.name, company.shortName, company.localName, company.address, company.status, actor.id],
      );
      const updated = await getCompanyRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: "companies",
          rowId: existing.id,
          action: "update",
          actorUserId: actor.id,
          oldData: toCompany(existing),
          newData: toCompany(updated),
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toCompany(updated));
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

companiesRouter.delete("/:id", requirePermission("settings:companies:delete"), async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const existing = await getCompanyRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const actor = await getRequestActor(req);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM companies WHERE id = $1", [existing.id]);
      await writeAuditLog(
        {
          tableName: "companies",
          rowId: existing.id,
          action: "delete",
          actorUserId: actor.id,
          oldData: toCompany(existing),
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
