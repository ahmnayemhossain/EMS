import { createSystemHeaders, parseSystemResponse } from "@/features/admin/settings/modules/api/system-api";

const REPORT_DEFS_API = "/api/system/report-definitions";

export type ReportVariableDef = {
  name: string;
  label?: string;
  type?: "text" | "date" | "number" | "company";
  required?: boolean;
  defaultValue?: unknown;
};

export type ReportDefinitionEntity = {
  id: string;
  key: string;
  name: string;
  description: string;
  requiresCompany: boolean;
  sqlText: string;
  variables: ReportVariableDef[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function listReportDefinitions(userId: string) {
  const response = await fetch(REPORT_DEFS_API, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<ReportDefinitionEntity[]>(response, "Reports request failed.");
}

export async function createReportDefinition(userId: string, def: Omit<ReportDefinitionEntity, "id" | "createdAt" | "updatedAt">) {
  const response = await fetch(REPORT_DEFS_API, {
    method: "POST",
    headers: createSystemHeaders(userId),
    body: JSON.stringify({
      ...def,
      requiresCompany: def.requiresCompany ? 1 : 0,
      isActive: def.isActive ? 1 : 0,
    }),
  });
  return parseSystemResponse<ReportDefinitionEntity>(response, "Reports request failed.");
}

export async function updateReportDefinition(userId: string, def: ReportDefinitionEntity) {
  const response = await fetch(`${REPORT_DEFS_API}/${def.id}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify({
      ...def,
      requiresCompany: def.requiresCompany ? 1 : 0,
      isActive: def.isActive ? 1 : 0,
    }),
  });
  return parseSystemResponse<ReportDefinitionEntity>(response, "Reports request failed.");
}

export async function deleteReportDefinition(userId: string, id: string) {
  const response = await fetch(`${REPORT_DEFS_API}/${id}`, {
    method: "DELETE",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<{ ok: true }>(response, "Reports request failed.");
}


