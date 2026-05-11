import { createSystemHeaders, parseSystemResponse } from "@/features/admin/settings/modules/api/system-api";

const METERS_API = "/api/system/meters";

export type UtilityTypeOption = { id: string; key: string; name: string };
export type SimpleOption = { id: string; name: string };

export type MeterEntity = {
  id: string;
  companyId: string;
  companyName: string;
  utilityTypeId: string;
  utilityType: string;
  utilityTypeName: string;
  name: string;
  code?: string;
  location?: string;
  sourceId?: string;
  sourceName?: string;
  uomId: string;
  uom: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function listMeters(userId: string, input?: { companyId?: string; utilityTypeId?: string }) {
  const params = new URLSearchParams();
  if (input?.companyId) params.set("companyId", input.companyId);
  if (input?.utilityTypeId) params.set("utilityTypeId", input.utilityTypeId);
  const url = params.toString() ? `${METERS_API}?${params.toString()}` : METERS_API;
  const response = await fetch(url, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<MeterEntity[]>(response, "Meters request failed.");
}

export async function createMeter(userId: string, meter: {
  companyId: string;
  utilityTypeId: string;
  uomId: string;
  sourceId?: string;
  name: string;
  code?: string;
  location?: string;
  isActive: boolean;
}) {
  const response = await fetch(METERS_API, {
    method: "POST",
    headers: createSystemHeaders(userId),
    body: JSON.stringify({
      ...meter,
      isActive: meter.isActive ? 1 : 0,
    }),
  });
  return parseSystemResponse<MeterEntity>(response, "Meters request failed.");
}

export async function updateMeter(userId: string, meter: {
  id: string;
  companyId: string;
  utilityTypeId: string;
  uomId: string;
  sourceId?: string;
  name: string;
  code?: string;
  location?: string;
  isActive: boolean;
}) {
  const response = await fetch(`${METERS_API}/${meter.id}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify({
      ...meter,
      isActive: meter.isActive ? 1 : 0,
    }),
  });
  return parseSystemResponse<MeterEntity>(response, "Meters request failed.");
}

export async function deleteMeter(userId: string, id: string) {
  const response = await fetch(`${METERS_API}/${id}`, {
    method: "DELETE",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<{ ok: true }>(response, "Meters request failed.");
}

