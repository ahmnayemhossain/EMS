import { authJsonHeaders, parseJsonResponse } from "@/core/app/lib/api";

export type ReportVariableDef = {
  name: string;
  label?: string;
  type?: "text" | "date" | "number" | "company";
  required?: boolean;
  defaultValue?: unknown;
};

export type ReportDefinition = {
  id: string;
  key: string;
  name: string;
  description: string;
  requiresCompany: boolean;
  variables: ReportVariableDef[];
};

export async function listReportDefinitions(userId: string) {
  const response = await fetch("/api/reports/definitions", {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<ReportDefinition[]>(response, "Reports request failed.");
}

export async function runReport(userId: string, key: string, variables: Record<string, unknown>) {
  const response = await fetch(`/api/reports/${encodeURIComponent(key)}/run`, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(variables),
  });
  return parseJsonResponse<{ rows: Array<Record<string, any>> }>(response, "Report run failed.");
}

