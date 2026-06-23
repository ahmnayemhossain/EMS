import { authJsonHeaders, parseJsonResponse } from "@/core/app/lib/api";
import type { Chemical, HazardClass, SDSRecord } from "@/core/types/models/ems";

const CHEMICALS_API = "/api/chemicals";
const SDS_API = "/api/sds";

export async function listChemicals(userId: string, input?: { companyId?: string }) {
  const params = new URLSearchParams();
  if (input?.companyId) params.set("companyId", input.companyId);
  const url = params.toString() ? `${CHEMICALS_API}?${params.toString()}` : CHEMICALS_API;
  const response = await fetch(url, { cache: "no-store", headers: authJsonHeaders(userId) });
  const data = await parseJsonResponse<unknown>(response, "Chemicals request failed.");
  if (!Array.isArray(data)) throw new Error("Chemicals request returned invalid data.");
  return data as Chemical[];
}

export async function listChemicalSdsRecords(userId: string) {
  const response = await fetch(SDS_API, { cache: "no-store", headers: authJsonHeaders(userId) });
  const data = await parseJsonResponse<unknown>(response, "SDS request failed.");
  if (!Array.isArray(data)) throw new Error("SDS request returned invalid data.");
  return data as SDSRecord[];
}

export async function createChemical(
  userId: string,
  input: {
    facilityId: string;
    name: string;
    tradeName?: string;
    supplier?: string;
    storageArea: string;
    hazardClasses: HazardClass[];
    approvalStatus: "approved" | "pending" | "restricted";
    stockKg: number;
    minStockKg?: number;
    expiryDate?: string;
    sdsId?: string;
    ppe: string[];
    storageInstructions: string[];
    compatibilityWarnings: string[];
    linkedWasteStream?: string;
    batches?: Array<{ batchNo: string; receivedAt: string; qtyKg: number }>;
  },
) {
  const response = await fetch(CHEMICALS_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<Chemical>(response, "Chemicals request failed.");
}

export async function updateChemical(
  userId: string,
  id: string,
  input: Parameters<typeof createChemical>[1],
) {
  const response = await fetch(`${CHEMICALS_API}/${id}`, {
    method: "PUT",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<Chemical>(response, "Chemicals request failed.");
}

export async function deleteChemical(userId: string, id: string) {
  const response = await fetch(`${CHEMICALS_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Chemicals request failed.");
}
