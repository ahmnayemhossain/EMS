import { authJsonHeaders, fileToBase64, parseJsonResponse } from "@/core/app/lib/api";
import type { WastewaterRecord } from "@/core/types/models/ems";

const WASTEWATER_API = "/api/wastewater";

export type WastewaterRecordInput = {
  facilityId: string;
  sampleDate: string;
  point: WastewaterRecord["point"];
  pH: number;
  COD: number;
  BOD: number;
  TSS: number;
  DO?: number;
  labReportFileName?: string;
  notes?: string;
};

export async function listWastewaterRecords(userId: string, input?: { companyId?: string }) {
  const params = new URLSearchParams();
  if (input?.companyId) params.set("companyId", input.companyId);
  const url = params.toString() ? `${WASTEWATER_API}?${params.toString()}` : WASTEWATER_API;
  const response = await fetch(url, { cache: "no-store", headers: authJsonHeaders(userId) });
  const data = await parseJsonResponse<unknown>(response, "Wastewater request failed.");
  if (!Array.isArray(data)) throw new Error("Wastewater request returned invalid data.");
  return data as WastewaterRecord[];
}

export async function getWastewaterRecord(userId: string, id: string) {
  const response = await fetch(`${WASTEWATER_API}/${id}`, { cache: "no-store", headers: authJsonHeaders(userId) });
  return parseJsonResponse<WastewaterRecord>(response, "Wastewater request failed.");
}

export async function createWastewaterRecord(userId: string, input: WastewaterRecordInput) {
  const response = await fetch(WASTEWATER_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<WastewaterRecord>(response, "Wastewater request failed.");
}

export async function updateWastewaterRecord(userId: string, id: string, input: WastewaterRecordInput) {
  const response = await fetch(`${WASTEWATER_API}/${id}`, {
    method: "PUT",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<WastewaterRecord>(response, "Wastewater request failed.");
}

export async function uploadWastewaterLabReport(userId: string, input: { recordId: string; file: File }) {
  const response = await fetch(`${WASTEWATER_API}/${input.recordId}/lab-report`, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify({
      fileName: input.file.name,
      mimeType: input.file.type || "application/pdf",
      dataBase64: await fileToBase64(input.file),
    }),
  });
  return parseJsonResponse<WastewaterRecord>(response, "Wastewater lab report upload failed.");
}

export async function deleteWastewaterRecord(userId: string, id: string) {
  const response = await fetch(`${WASTEWATER_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Wastewater request failed.");
}
