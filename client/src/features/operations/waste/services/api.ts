import { authJsonHeaders, fileToBase64, parseJsonResponse } from "@/core/app/lib/api";
import type { WasteRecord } from "@/core/types/models/ems";

const WASTE_API = "/api/waste";

export type WasteRecordInput = {
  facilityId: string;
  date: string;
  stream: string;
  type: WasteRecord["type"];
  qtyKg: number;
  storageLocation: string;
  vendor?: string;
  disposalStatus?: WasteRecord["disposalStatus"];
  manifestNo?: string;
  dueBy?: string;
  notes?: string;
};

export async function listWasteRecords(userId: string, input?: { companyId?: string }) {
  const params = new URLSearchParams();
  if (input?.companyId) params.set("companyId", input.companyId);
  const url = params.toString() ? `${WASTE_API}?${params.toString()}` : WASTE_API;
  const response = await fetch(url, { cache: "no-store", headers: authJsonHeaders(userId) });
  const data = await parseJsonResponse<unknown>(response, "Waste request failed.");
  if (!Array.isArray(data)) throw new Error("Waste request returned invalid data.");
  return data as WasteRecord[];
}

export async function getWasteRecord(userId: string, id: string) {
  const response = await fetch(`${WASTE_API}/${id}`, { cache: "no-store", headers: authJsonHeaders(userId) });
  return parseJsonResponse<WasteRecord>(response, "Waste request failed.");
}

export async function createWasteRecord(userId: string, input: WasteRecordInput) {
  const response = await fetch(WASTE_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<WasteRecord>(response, "Waste request failed.");
}

export async function updateWasteRecord(userId: string, id: string, input: WasteRecordInput) {
  const response = await fetch(`${WASTE_API}/${id}`, {
    method: "PUT",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<WasteRecord>(response, "Waste request failed.");
}

export async function uploadWasteAttachment(userId: string, input: { recordId: string; file: File }) {
  const response = await fetch(`${WASTE_API}/${input.recordId}/attachment`, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify({
      fileName: input.file.name,
      mimeType: input.file.type || "application/pdf",
      dataBase64: await fileToBase64(input.file),
    }),
  });
  return parseJsonResponse<WasteRecord>(response, "Waste attachment upload failed.");
}

export async function deleteWasteRecord(userId: string, id: string) {
  const response = await fetch(`${WASTE_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Waste request failed.");
}
