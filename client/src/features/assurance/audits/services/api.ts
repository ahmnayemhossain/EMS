import { authJsonHeaders, parseJsonResponse } from "@/core/app/lib/api";
import type { AuditRecord } from "@/core/types/models/audit";

const AUDITS_API = "/api/audits";

export async function listAuditRecords(userId: string, companyId?: string) {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  const response = await fetch(`${AUDITS_API}${params.size ? `?${params.toString()}` : ""}`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<AuditRecord[]>(response, "Audit request failed.");
}

export async function createAuditRecordApi(userId: string, record: Omit<AuditRecord, "id" | "createdAt" | "companyName">) {
  const response = await fetch(AUDITS_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(record),
  });
  return parseJsonResponse<AuditRecord>(response, "Could not create audit.");
}

export async function deleteAuditRecordApi(userId: string, id: string) {
  const response = await fetch(`${AUDITS_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Could not delete audit.");
}
