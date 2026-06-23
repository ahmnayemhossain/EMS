import { authJsonHeaders, parseJsonResponse } from "@/core/app/lib/api";
import type {
  UtilityApprovalFlow,
  UtilityMasterMeter,
  UtilityMeterOption,
  UtilityRecord,
  UtilitySourceOption,
  UtilityUomOption,
  UtilityType,
} from "@/core/types/models/ems";

const UTILITIES_API = "/api/utilities";
export type UtilityRecordInput = Omit<UtilityRecord, "id"> & { id?: number };

export async function listUtilityRecords(
  userId: string,
  input?: { facilityId?: string; type?: UtilityType; search?: string },
) {
  const params = new URLSearchParams();
  if (input?.facilityId) params.set("facilityId", input.facilityId);
  if (input?.type) params.set("type", input.type);
  if (input?.search) params.set("search", input.search);
  const url = params.toString() ? `${UTILITIES_API}?${params.toString()}` : UTILITIES_API;
  const response = await fetch(url, { cache: "no-store", headers: authJsonHeaders(userId) });
  return parseJsonResponse<UtilityRecord[]>(response, "Utilities request failed.");
}

export async function listUtilityUomOptions(userId: string) {
  const response = await fetch(`${UTILITIES_API}/uom-options`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<UtilityUomOption[]>(response, "Utilities request failed.");
}

export async function listUtilitySourceOptions(userId: string) {
  const response = await fetch(`${UTILITIES_API}/source-options`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<UtilitySourceOption[]>(response, "Utilities request failed.");
}

export async function createUtilityRecord(record: UtilityRecordInput, userId: string) {
  const response = await fetch(UTILITIES_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(record),
  });

  return parseJsonResponse<UtilityRecord>(response, "Utilities request failed.");
}

export async function updateUtilityRecord(id: number, record: UtilityRecordInput, userId: string) {
  const response = await fetch(`${UTILITIES_API}/${id}`, {
    method: "PUT",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(record),
  });

  return parseJsonResponse<UtilityRecord>(response, "Utilities request failed.");
}

export async function transitionUtilityMonth(id: number, transitionKey: string, userId: string, note?: string) {
  const response = await fetch(`${UTILITIES_API}/${id}/transition-month`, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify({ transitionKey, note }),
  });

  return parseJsonResponse<UtilityRecord>(response, "Utilities request failed.");
}

export async function deleteUtilityRecord(id: number, userId: string) {
  const response = await fetch(`${UTILITIES_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });

  return parseJsonResponse<{ ok: true }>(response, "Utilities request failed.");
}

export async function uploadUtilityAttachment(
  id: number,
  input: { fileName: string; mimeType: string; dataBase64: string },
  userId: string,
) {
  const response = await fetch(`${UTILITIES_API}/${id}/attachment`, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });

  return parseJsonResponse<UtilityRecord>(response, "Utilities request failed.");
}

export async function listUtilityMeters(
  userId: string,
  input: { companyId: string; type: UtilityType; sourceId?: string },
) {
  const params = new URLSearchParams({ companyId: input.companyId, type: input.type });
  if (input.sourceId) params.set("sourceId", input.sourceId);
  const response = await fetch(`${UTILITIES_API}/meters?${params.toString()}`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<UtilityMeterOption[]>(response, "Utilities request failed.");
}

export async function listUtilityMasterMeters(userId: string, input: { companyId: string }) {
  const params = new URLSearchParams({ companyId: input.companyId });
  const response = await fetch(`${UTILITIES_API}/master-data?${params.toString()}`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<UtilityMasterMeter[]>(response, "Utilities request failed.");
}

export async function getUtilityApprovalFlow(userId: string, recordId?: number) {
  const url = recordId ? `${UTILITIES_API}/${recordId}/approval-flow` : `${UTILITIES_API}/approval-flow`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<UtilityApprovalFlow>(response, "Utilities request failed.");
}

export async function getUtilityConversionRules(userId: string, input: { companyId: string }) {
  const params = new URLSearchParams({ companyId: input.companyId });
  const response = await fetch(`${UTILITIES_API}/conversion-rules?${params.toString()}`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ generatorDieselKwhPerLiter: number | null }>(
    response,
    "Utilities request failed.",
  );
}
