import { authJsonHeaders, parseJsonResponse } from "@/app/lib/api";
import type { UtilityRecord, UtilitySourceOption, UtilityUomOption } from "@/types/ems";

const UTILITIES_API = "/api/utilities";
export type UtilityRecordInput = Omit<UtilityRecord, "id"> & { id?: number };

export async function listUtilityRecords(userId: string) {
  const response = await fetch(UTILITIES_API, { cache: "no-store", headers: authJsonHeaders(userId) });
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
