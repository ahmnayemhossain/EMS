import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query, withTransaction } from "../../../../core/shared/postgres.js";
import {
  ensureDirectory,
  MAX_PDF_BYTES,
  removeFileIfExists,
  resolveCdnPath,
  sanitizeFilePart,
} from "../../../../core/shared/storage.js";
import { normalizeAttachmentInput } from "../../../modules/utilities/record.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToWastewaterRecord } from "./map.js";
import { selectWastewaterSql } from "./sql.js";

export async function uploadWastewaterLabReport(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const attachment = normalizeAttachmentInput(req.body || {}, MAX_PDF_BYTES);
    const existing = await query(
      `SELECT id, facility_id, sample_point, sample_date
       FROM wastewater_lab_records wlr
       WHERE wlr.id = $1
         AND EXISTS (
           SELECT 1
           FROM user_companies uc
           WHERE uc.user_id = $2
             AND uc.company_id = wlr.facility_id
         )`,
      [req.params.id, userDbId],
    );
    if (!existing.rowCount) throw createHttpError(404, "Wastewater record not found.");

    const row = existing.rows[0];
    const previousFiles = await query(
      `SELECT storage_path
       FROM file_assets
       WHERE module = 'wastewater'
         AND entity_type = 'wastewater_lab_record'
         AND entity_id = $1`,
      [row.id],
    );

    const now = new Date();
    const year = String(row.sample_date).slice(0, 4) || String(now.getFullYear());
    const storedName =
      [
        "wastewater",
        sanitizeFilePart(row.sample_point),
        String(row.id),
        now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
        randomUUID().slice(0, 8),
      ].join("_") + ".pdf";
    const relativeDir = ["wastewater", year].join("/");
    const relativePath = `${relativeDir}/${storedName}`;

    await ensureDirectory(resolveCdnPath(relativeDir));
    await writeFile(resolveCdnPath(relativePath), attachment.buffer);

    await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM file_assets
         WHERE module = 'wastewater'
           AND entity_type = 'wastewater_lab_record'
           AND entity_id = $1`,
        [row.id],
      );

      await client.query(
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
         VALUES ('wastewater','wastewater_lab_record',$1,$2,$3,$4,'local-cdn',$5,$6,$7,$8)`,
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

      await client.query(
        `UPDATE wastewater_lab_records
         SET lab_report_name = $2,
             updated_by_user_id = $3,
             updated_at = NOW()
         WHERE id = $1`,
        [row.id, attachment.fileName, userDbId],
      );
    });

    for (const file of previousFiles.rows) {
      if (file.storage_path) await removeFileIfExists(resolveCdnPath(file.storage_path));
    }

    const updated = await query(`${selectWastewaterSql} WHERE wlr.id = $1`, [row.id]);
    res.json(rowToWastewaterRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}
