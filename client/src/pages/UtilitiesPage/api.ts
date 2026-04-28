import type { UtilityRecord } from "@/types/ems";

const UTILITIES_API = "/api/utilities";
export type UtilityRecordInput = Omit<UtilityRecord, "id"> & { id?: number };

function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

function headers(userId: string) {
  return {
    "Content-Type": "application/json",
    "x-user-id": toServerUserId(userId),
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "Utilities request failed.";
    throw new Error(message);
  }

  return data as T;
}

export async function listUtilityRecords(userId: string) {
  const response = await fetch(UTILITIES_API, { cache: "no-store", headers: headers(userId) });
  return parseJsonResponse<UtilityRecord[]>(response);
}

export async function createUtilityRecord(record: UtilityRecordInput, userId: string) {
  const response = await fetch(UTILITIES_API, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(record),
  });

  return parseJsonResponse<UtilityRecord>(response);
}

export async function updateUtilityRecord(id: number, record: UtilityRecordInput, userId: string) {
  const response = await fetch(`${UTILITIES_API}/${id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(record),
  });

  return parseJsonResponse<UtilityRecord>(response);
}

export async function deleteUtilityRecord(id: number, userId: string) {
  const response = await fetch(`${UTILITIES_API}/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });

  return parseJsonResponse<{ ok: true }>(response);
}
