import { createHttpError } from "../../../features/modules/utilities/record.js";

function normalizeText(value) {
  return String(value ?? "").trim();
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
    if (!["text", "date", "number", "company"].includes(type)) throw createHttpError(400, `Invalid variable type: ${type}`);
  }
}
