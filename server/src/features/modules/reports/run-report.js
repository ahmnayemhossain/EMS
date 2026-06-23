import { query, withTransaction } from "../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../core/shared/schema.js";

import { assertUserCompanyAccess } from "../utilities/access.js";
import { createHttpError } from "../utilities/record.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../routes/utilities/request-context.js";

const PLACEHOLDER_RE = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

function stripSqlComments(sql) {
  const raw = String(sql || "");
  // remove /* */ blocks
  const withoutBlocks = raw.replace(/\/\*[\s\S]*?\*\//g, " ");
  // remove -- line comments
  return withoutBlocks.replace(/--.*$/gm, " ");
}

function isSelectQuery(sql) {
  const trimmed = stripSqlComments(sql).trim();
  if (!trimmed) return false;
  const first = trimmed.split(/\s+/)[0]?.toLowerCase();
  return first === "select" || first === "with";
}

function assertQuerySafe(sql) {
  const text = stripSqlComments(sql).trim();
  if (!isSelectQuery(text)) throw createHttpError(400, "Only SELECT queries are allowed.");
  if (text.includes(";")) throw createHttpError(400, "Multiple statements are not allowed.");
  const lowered = text.toLowerCase();
  const banned = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|do|execute|set)\b/;
  if (banned.test(lowered)) throw createHttpError(400, "Unsafe SQL keywords detected.");
}

function buildQuery(sqlText, values) {
  const params = [];
  const sql = String(sqlText || "").replace(PLACEHOLDER_RE, (_, name) => {
    if (!(name in values)) throw createHttpError(400, `Missing variable: ${name}`);
    params.push(values[name]);
    return `$${params.length}`;
  });
  return { sql, params };
}

export async function listActiveReportDefinitions() {
  await ensureCoreSchema();
  const result = await query(
    `SELECT id, key, name, description, requires_company, variables FROM report_definitions WHERE is_active = 1 ORDER BY name ASC`,
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    key: row.key,
    name: row.name,
    description: row.description || "",
    requiresCompany: Number(row.requires_company) === 1,
    variables: Array.isArray(row.variables) ? row.variables : [],
  }));
}

export async function runReportByKey(input) {
  await ensureCoreSchema();
  const key = String(input?.key || "").trim();
  if (!key) throw createHttpError(400, "Report key is required.");

  const userDbId = await getRequestUserDbId(input.req);

  const defRes = await query(`SELECT * FROM report_definitions WHERE key = $1 AND is_active = 1`, [key]);
  const def = defRes.rows[0];
  if (!def) throw createHttpError(404, "Report not found.");

  const requiresCompany = Number(def.requires_company) === 1;
  const variables = Array.isArray(def.variables) ? def.variables : [];

  const rawVars = typeof input?.variables === "object" && input.variables ? input.variables : {};
  const values = {};

  // declared variables
  for (const v of variables) {
    const name = String(v?.name ?? "").trim();
    if (!name) continue;
    values[name] = rawVars[name];
  }

  // company gate
  if (requiresCompany) {
    const companyId = String(rawVars.companyId || "").trim();
    if (!companyId) throw createHttpError(400, "companyId is required.");
    const companyDbId = await getCompanyDbIdOrThrow(companyId);
    await assertUserCompanyAccess(userDbId, companyDbId);
    values.companyId = companyId;
    values.companyDbId = companyDbId;
  } else if (rawVars.companyId) {
    const companyId = String(rawVars.companyId || "").trim();
    if (companyId) {
      const companyDbId = await getCompanyDbIdOrThrow(companyId);
      await assertUserCompanyAccess(userDbId, companyDbId);
      values.companyId = companyId;
      values.companyDbId = companyDbId;
    }
  }

  assertQuerySafe(def.sql_text);
  const { sql, params } = buildQuery(def.sql_text, values);

  const maxRows = Number(input?.maxRows ?? 2000);
  const wrappedSql = Number.isFinite(maxRows) && maxRows > 0
    ? `SELECT * FROM (${sql}) AS q LIMIT ${Math.floor(maxRows)}`
    : `SELECT * FROM (${sql}) AS q`;
  const timeoutMs = Number(process.env.REPORT_QUERY_TIMEOUT_MS || 8000);
  const result = await withTransaction(async (client) => {
    if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
      await client.query(`SET LOCAL statement_timeout = '${Math.floor(timeoutMs)}ms'`);
    }
    return client.query(wrappedSql, params);
  });

  return result.rows;
}

export function convertRowsToCsv(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!safeRows.length) return "";

  const headers = Object.keys(safeRows[0] || {});
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escapeCsv).join(","),
    ...safeRows.map((row) => headers.map((key) => escapeCsv(row?.[key])).join(",")),
  ];
  return lines.join("\n");
}
