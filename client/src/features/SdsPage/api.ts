import { authJsonHeaders, fileToBase64, parseJsonResponse } from "@/core/app/lib/api";
import type { SDSRecord } from "@/core/types/ems";

const SDS_API = "/api/sds";

export async function listSdsRecords(userId: string) {
  const response = await fetch(SDS_API, { cache: "no-store", headers: authJsonHeaders(userId) });
  const data = await parseJsonResponse<unknown>(response, "SDS request failed.");
  if (!Array.isArray(data)) throw new Error("SDS request returned invalid data.");
  return data as SDSRecord[];
}

export async function createSdsRecord(userId: string, input: Omit<SDSRecord, "id" | "fileName" | "files"> & { fileName?: string }) {
  const response = await fetch(SDS_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<SDSRecord>(response, "SDS request failed.");
}

export async function updateSdsRecord(userId: string, id: string, input: Omit<SDSRecord, "id" | "fileName" | "files"> & { fileName?: string }) {
  const response = await fetch(`${SDS_API}/${id}`, {
    method: "PUT",
    headers: authJsonHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseJsonResponse<SDSRecord>(response, "SDS request failed.");
}

export async function deleteSdsRecord(userId: string, id: string) {
  const response = await fetch(`${SDS_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "SDS request failed.");
}

export async function uploadSdsPdf(
  userId: string,
  input: { sdsId: string; file: File },
) {
  const response = await fetch(`${SDS_API}/${input.sdsId}/pdf`, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify({
      fileName: input.file.name,
      mimeType: input.file.type,
      dataBase64: await fileToBase64(input.file),
    }),
  });
  return parseJsonResponse<SDSRecord>(response, "SDS upload failed.");
}
