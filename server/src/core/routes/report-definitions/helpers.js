import { createHttpError } from "../../../features/modules/utilities/record.js";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function stripSqlComments(sql) {
  const raw = String(sql || "");
  const withoutBlocks = raw.replace(/\/\*[\s\S]*?\*\//g, " ");
  return withoutBlocks.replace(/--.*$/gm, " ");
}

function isSelectQuery(sql) {
  const trimmed = stripSqlComments(sql).trim();
  if (!trimmed) return false;
  const first = trimmed.split(/\s+/)[0]?.toLowerCase();
  return first === "select" || first === "with";
}

function assertSqlTextSafe(sqlText) {
  const text = stripSqlComments(sqlText).trim();
  if (!isSelectQuery(text)) throw createHttpError(400, "Only SELECT queries are allowed.");
  if (text.includes(";")) throw createHttpError(400, "Multiple SQL statements are not allowed.");

  const lowered = text.toLowerCase();
  const banned = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|do|execute|set)\b/;
  if (banned.test(lowered)) throw createHttpError(400, "Unsafe SQL keywords detected.");
}

export function normalizeReportDefinitionInput(input) {
  const key = normalizeText(input?.key);
  const name = normalizeText(input?.name);
  const description = normalizeText(input?.description);
  const sqlText = normalizeText(input?.sqlText ?? input?.sql_text);
  const requiresCompany = input?.requiresCompany ?? input?.requires_company;
  const isActive = input?.isActive ?? input?.is_active;
  const variables = input?.variables;

  if (!key) throw createHttpError(400, "Report key is required.");
  if (!/^[a-z][a-z0-9_]{2,80}$/i.test(key)) throw createHttpError(400, "Invalid report key.");
  if (!name) throw createHttpError(400, "Report name is required.");
  if (!sqlText) throw createHttpError(400, "SQL query is required.");
  assertSqlTextSafe(sqlText);

  const parsedVariables = Array.isArray(variables) ? variables : [];

  return {
    key,
    name,
    description: description || null,
    sqlText,
    requiresCompany: requiresCompany === false || requiresCompany === 0 ? 0 : 1,
    isActive: isActive === false || isActive === 0 ? 0 : 1,
    variables: parsedVariables,
  };
}

export function assertVariablesValid(variables) {
  if (!Array.isArray(variables)) throw createHttpError(400, "Variables must be an array.");
  for (const v of variables) {
    const name = String(v?.name ?? "").trim();
    if (!name) throw createHttpError(400, "Variable name is required.");
    if (!/^[a-z][a-z0-9_]{0,40}$/i.test(name)) throw createHttpError(400, `Invalid variable name: ${name}`);
    const type = String(v?.type ?? "text").trim();
    if (!["text", "date", "month", "number", "company"].includes(type)) throw createHttpError(400, `Invalid variable type: ${type}`);
  }
}
