import { authJsonHeaders, parseJsonResponse } from "@/core/app/lib/api";
import type { CAPA } from "@/core/types/models/ems";

const CAPA_API = "/api/capa";

export type CapaInput = {
  facilityId: string;
  title: string;
  description?: string;
  owner: string;
  severity: CAPA["severity"];
  status: CAPA["status"];
  dueDate: string;
  evidenceCount?: number;
  relatedFindingId?: string;
};

export async function listCapas(userId: string, input?: { companyId?: string }) {
  const params = new URLSearchParams();
  if (input?.companyId) params.set("companyId", input.companyId);
  const url = params.toString() ? `${CAPA_API}?${params.toString()}` : CAPA_API;
  const response = await fetch(url, { cache: "no-store", headers: authJsonHeaders(userId) });
  return parseJsonResponse<CAPA[]>(response, "CAPA request failed.");
}

export async function createCapa(userId: string, input: CapaInput) {
  const response = await fetch(CAPA_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<CAPA>(response, "CAPA request failed.");
}

export async function updateCapa(userId: string, id: string, input: CapaInput) {
  const response = await fetch(`${CAPA_API}/${id}`, {
    method: "PUT",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<CAPA>(response, "CAPA request failed.");
}

export async function moveCapa(userId: string, id: string, input: { facilityId: string; status: CAPA["status"]; targetIndex: number }) {
  const response = await fetch(`${CAPA_API}/${id}/move`, {
    method: "PATCH",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<CAPA>(response, "CAPA request failed.");
}

export async function deleteCapa(userId: string, id: string) {
  const response = await fetch(`${CAPA_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "CAPA request failed.");
}

export async function dismissCapa(userId: string, id: string, input: { facilityId: string; dismissed: boolean }) {
  const response = await fetch(`${CAPA_API}/${id}/dismiss`, {
    method: "PATCH",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<CAPA>(response, "CAPA request failed.");
}
