import { authJsonHeaders, fileToBase64, parseJsonResponse } from "@/core/app/lib/api";
import type { Document } from "@/core/types/models/ems";

const DOCUMENTS_API = "/api/documents";

export type DocumentCreateInput = {
  facilityId: string;
  title: string;
  category: Document["category"];
  ownerDepartment: string;
  expiresOn?: string;
  notes?: string;
  file?: File | null;
};

export async function listDocuments(userId: string, companyId?: string) {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  const response = await fetch(`${DOCUMENTS_API}${params.size ? `?${params.toString()}` : ""}`, {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<Document[]>(response, "Documents request failed.");
}

export async function createDocumentRecord(userId: string, input: DocumentCreateInput) {
  const response = await fetch(DOCUMENTS_API, {
    method: "POST",
    headers: authJsonHeaders(userId),
    body: JSON.stringify({
      facilityId: input.facilityId,
      title: input.title,
      category: input.category,
      ownerDepartment: input.ownerDepartment,
      expiresOn: input.expiresOn || "",
      notes: input.notes || "",
      file: input.file
        ? {
            fileName: input.file.name,
            mimeType: input.file.type || "application/octet-stream",
            dataBase64: await fileToBase64(input.file),
          }
        : null,
    }),
  });
  return parseJsonResponse<Document>(response, "Could not create document.");
}

export async function deleteDocumentRecord(userId: string, id: string) {
  const response = await fetch(`${DOCUMENTS_API}/${id}`, {
    method: "DELETE",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Could not delete document.");
}
