import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { pool, query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { MAX_PDF_BYTES, ensureDirectory, resolveCdnPath, sanitizeFilePart } from "../../../../core/shared/storage.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToSdsRecord } from "./map.js";
import { selectSdsSql } from "./sql.js";

function normalizePdfInput(input) {
  const fileName = String(input?.fileName || "").trim();
  const mimeType = String(input?.mimeType || "").trim().toLowerCase();
  const dataBase64 = String(input?.dataBase64 || "");
  if (!fileName) throw createHttpError(400, "fileName is required.");
  if (!dataBase64) throw createHttpError(400, "dataBase64 is required.");
  if (mimeType && mimeType !== "application/pdf" && mimeType !== "application/x-pdf") throw createHttpError(400, "Only PDF is allowed.");
  const buffer = Buffer.from(dataBase64, "base64");
  if (!buffer.length) throw createHttpError(400, "Invalid file data.");
  if (buffer.length > MAX_PDF_BYTES) throw createHttpError(400, "PDF too large.");
  return { fileName, mimeType: mimeType || "application/pdf", buffer };
}

export async function uploadSdsPdf(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    const attachment = normalizePdfInput(req.body || {});

    const existing = await query("SELECT id, chemical_name, supplier, revision_date FROM sds_records WHERE id = $1", [req.params.id]);
    if (!existing.rowCount) return res.status(404).json({ error: "not_found" });
    const row = existing.rows[0];

    const now = new Date();
    const year = String(row.revision_date).slice(0, 4) || String(now.getFullYear());
    const storedName = ["sds", sanitizeFilePart(row.chemical_name), String(row.id), now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14), randomUUID().slice(0, 8)].join("_") + ".pdf";
    const relativeDir = ["sds", year].join("/");
    const relativePath = `${relativeDir}/${storedName}`;

    await ensureDirectory(resolveCdnPath(relativeDir));
    await writeFile(resolveCdnPath(relativePath), attachment.buffer);

    await query(
      `INSERT INTO file_assets (module, entity_type, entity_id, original_name, stored_name, storage_disk, storage_path, mime_type, file_size, uploaded_by_user_id) VALUES ('sds','sds_record',$1,$2,$3,'local-cdn',$4,$5,$6,$7)`,
      [row.id, attachment.fileName, storedName, relativePath, attachment.mimeType, attachment.buffer.length, userDbId],
    );

    await query("UPDATE sds_records SET file_name = $2, updated_by_user_id = $3, updated_at = NOW() WHERE id = $1", [
      row.id,
      attachment.fileName,
      userDbId,
    ]);

    const updated = await query(`${selectSdsSql} WHERE sr.id = $1`, [row.id]);
    res.json(rowToSdsRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}

