import type { ReportDefinition, ReportVariableDef } from "@/features/assurance/reports/services/api";

export type ReportRow = Record<string, unknown>;

export function buildRunPayload(def: ReportDefinition, values: Record<string, string>, selectedCompanyId?: string) {
  const payload: Record<string, unknown> = {};

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name) continue;
    if (name === "companyId") {
      payload.companyId = selectedCompanyId ?? values.companyId ?? "";
      continue;
    }
    payload[name] = values[name] ?? "";
  }

  if (def.requiresCompany) payload.companyId = selectedCompanyId ?? values.companyId ?? "";
  return payload;
}

export function validateReportInputs(def: ReportDefinition, values: Record<string, string>, selectedCompanyId?: string) {
  if (def.requiresCompany && !selectedCompanyId) return "Select a company first.";

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name || name === "companyId") continue;
    if (variable.required && !String(values[name] ?? "").trim()) {
      return `${variable.label || name} is required.`;
    }
  }

  return "";
}

export function getDefaultVarValues(def: ReportDefinition | null, selectedCompanyId?: string) {
  const base: Record<string, string> = {};
  if (!def) return base;

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name) continue;

    if (name === "companyId") {
      base.companyId = selectedCompanyId || "";
      continue;
    }

    const explicitValue = variable.defaultValue != null ? String(variable.defaultValue) : "";
    if (explicitValue) {
      base[name] = explicitValue;
      continue;
    }

    if (variable.type === "date") {
      if (/from/i.test(name)) {
        base[name] = getMonthStartDate();
        continue;
      }
      if (/to/i.test(name) || /end/i.test(name)) {
        base[name] = getTodayDate();
        continue;
      }
    }

    base[name] = "";
  }

  return base;
}

export function getInputType(variable: ReportVariableDef) {
  if (variable.type === "date") return "date";
  if (variable.type === "number") return "number";
  return "text";
}

export function getInputPlaceholder(variable: ReportVariableDef) {
  if (variable.type === "date") return "YYYY-MM-DD";
  if (variable.type === "number") return "0";
  return "Value";
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthStartDate() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

export function formatCellValue(value: unknown) {
  if (value == null || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function getColumnKeys(rows: ReportRow[]) {
  const first = rows[0];
  if (!first || typeof first !== "object") return [];
  return Object.keys(first);
}
