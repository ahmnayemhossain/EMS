import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import {
  ensureDirectory,
  MAX_PDF_BYTES,
  resolveCdnPath,
  sanitizeFilePart,
} from "../../../../core/shared/storage.js";
import { query } from "../../../../core/shared/postgres.js";
import { createHttpError } from "../../../modules/utilities/record.js";

const MAX_DOCUMENT_BYTES = MAX_PDF_BYTES;

export function normalizeDocumentFile(input) {
  const fileName = String(input?.fileName || "").trim();
  const mimeType = String(input?.mimeType || "").trim() || "application/octet-stream";
  const dataBase64 = String(input?.dataBase64 || "");

  if (!fileName) throw createHttpError(400, "Document fileName is required.");
  if (!dataBase64) throw createHttpError(400, "Document file data is required.");

  const buffer = Buffer.from(dataBase64, "base64");
  if (!buffer.length) throw createHttpError(400, "Invalid document file.");
  if (buffer.length > MAX_DOCUMENT_BYTES) throw createHttpError(400, "Document file too large.");

  return { fileName, mimeType, buffer };
}

export async function persistDocumentFile({ recordId, companyDbId, title, attachment, userDbId }) {
  const now = new Date();
  const year = String(now.getFullYear());
  const extension = String(attachment.fileName).includes(".")
    ? String(attachment.fileName).split(".").pop()
    : "bin";
  const storedName = [
    "document",
    sanitizeFilePart(title),
    String(recordId),
    now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
    randomUUID().slice(0, 8),
  ].join("_") + `.${extension}`;

  const relativeDir = ["documents", year].join("/");
  const relativePath = `${relativeDir}/${storedName}`;

  await ensureDirectory(resolveCdnPath(relativeDir));
  await writeFile(resolveCdnPath(relativePath), attachment.buffer);

  await query(
    `INSERT INTO file_assets (module, entity_type, entity_id, company_id, original_name, stored_name, storage_disk, storage_path, mime_type, file_size, uploaded_by_user_id) VALUES ('documents','document_record',$1,$2,$3,$4,'local-cdn',$5,$6,$7,$8)`,
    [
      recordId,
      companyDbId,
      attachment.fileName,
      storedName,
      relativePath,
      attachment.mimeType,
      attachment.buffer.length,
      userDbId,
    ],
  );
}
