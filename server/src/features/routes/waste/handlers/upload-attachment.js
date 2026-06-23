import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import {
  ensureDirectory,
  MAX_PDF_BYTES,
  resolveCdnPath,
  sanitizeFilePart,
} from "../../../../core/shared/storage.js";
import { normalizeAttachmentInput } from "../../../modules/utilities/record.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToWasteRecord } from "./map.js";
import { selectWasteSql } from "./sql.js";

export async function uploadWasteAttachment(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const attachment = normalizeAttachmentInput(req.body || {}, MAX_PDF_BYTES);
    const existing = await query(
      `SELECT id, facility_id, stream, log_date
       FROM waste_records wr
       WHERE wr.id = $1
         AND EXISTS (
           SELECT 1
           FROM user_companies uc
           WHERE uc.user_id = $2
             AND uc.company_id = wr.facility_id
         )`,
      [req.params.id, userDbId],
    );
    if (!existing.rowCount) throw createHttpError(404, "Waste record not found.");

    const row = existing.rows[0];
    const now = new Date();
    const year = String(row.log_date).slice(0, 4) || String(now.getFullYear());
    const storedName =
      [
        "waste",
        sanitizeFilePart(row.stream),
        String(row.id),
        now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
        randomUUID().slice(0, 8),
      ].join("_") + ".pdf";
    const relativeDir = ["waste", year].join("/");
    const relativePath = `${relativeDir}/${storedName}`;

    await ensureDirectory(resolveCdnPath(relativeDir));
    await writeFile(resolveCdnPath(relativePath), attachment.buffer);

    await query(
      `INSERT INTO file_assets (
         module,
         entity_type,
         entity_id,
         company_id,
         original_name,
         stored_name,
         storage_disk,
         storage_path,
         mime_type,
         file_size,
         uploaded_by_user_id
       )
       VALUES ('waste','waste_record',$1,$2,$3,$4,'local-cdn',$5,$6,$7,$8)`,
      [
        row.id,
        row.facility_id,
        attachment.fileName,
        storedName,
        relativePath,
        attachment.mimeType,
        attachment.buffer.length,
        userDbId,
      ],
    );

    const updated = await query(`${selectWasteSql} WHERE wr.id = $1`, [row.id]);
    res.json(rowToWasteRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}
