import type { ReportDefinition, ReportVariableDef } from "@/features/assurance/reports/services/api";

export type ReportRow = Record<string, unknown>;
export type ReportCategoryKey = "master" | "records" | "approved" | "exceptions" | "reference";

export function getReportCategory(def: ReportDefinition): { key: ReportCategoryKey; label: string; description: string } {
  const key = def.key.toLowerCase();
  const name = def.name.toLowerCase();

  if (key.includes("master") || name.includes("master")) {
    return { key: "master", label: "Master Data", description: "Reference and setup reports." };
  }

  if (key.includes("approved") || key.includes("audit") || name.includes("approved")) {
    return { key: "approved", label: "Approved Data", description: "Approved and audited report outputs." };
  }

  if (key.includes("noise") || key.includes("exception") || name.includes("exception")) {
    return { key: "exceptions", label: "Exceptions", description: "Incomplete, draft, and follow-up items." };
  }

  if (key.includes("register") || name.includes("register")) {
    return { key: "reference", label: "Registers", description: "Static operational registers." };
  }

  return { key: "records", label: "Operational Logs", description: "Detailed transactional report data." };
}

export function getReportVariableSummary(def: ReportDefinition) {
  const variables = (def.variables || []).filter((variable) => variable.name !== "companyId");
  if (!variables.length) return "No extra filters";

  return variables
    .map((variable) => variable.label || variable.name)
    .join(", ");
}

export function getReportScopeLabel(def: ReportDefinition) {
  return def.requiresCompany ? "Company scoped" : "Global";
}

export function buildRunPayload(def: ReportDefinition, values: Record<string, string>, selectedCompanyId?: string) {
  const payload: Record<string, unknown> = {};

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name) continue;
    const rawValue = values[name] ?? "";
    const normalizedValue = variable.type === "month" && String(rawValue).trim()
      ? `${String(rawValue).trim()}-01`
      : rawValue;

    if (name === "companyId") {
      payload.companyId = selectedCompanyId ?? values.companyId ?? "";
      continue;
    }
    payload[name] = normalizedValue;
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

    if (variable.type === "month") {
      if (/from/i.test(name)) {
        base[name] = getMonthStartValue();
        continue;
      }
      if (/to/i.test(name) || /end/i.test(name)) {
        base[name] = getCurrentMonthValue();
        continue;
      }
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
  if (variable.type === "month") return "month";
  if (variable.type === "date") return "date";
  if (variable.type === "number") return "number";
  return "text";
}

export function getInputPlaceholder(variable: ReportVariableDef) {
  if (variable.type === "month") return "YYYY-MM";
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

export function getCurrentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthStartValue() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 7);
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
