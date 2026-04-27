import type { UtilityRecord } from "@/types/ems";

const UTILITIES_API = "/api/utilities";
export type UtilityRecordInput = Omit<UtilityRecord, "id"> & { id?: number };

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

export async function listUtilityRecords() {
  const response = await fetch(UTILITIES_API, { cache: "no-store" });
  return parseJsonResponse<UtilityRecord[]>(response);
}

export async function createUtilityRecord(record: UtilityRecordInput) {
  const response = await fetch(UTILITIES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  return parseJsonResponse<UtilityRecord>(response);
}

export async function updateUtilityRecord(id: number, record: UtilityRecordInput) {
  const response = await fetch(`${UTILITIES_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  return parseJsonResponse<UtilityRecord>(response);
}

export async function deleteUtilityRecord(id: number) {
  const response = await fetch(`${UTILITIES_API}/${id}`, {
    method: "DELETE",
  });

  return parseJsonResponse<{ ok: true }>(response);
}
