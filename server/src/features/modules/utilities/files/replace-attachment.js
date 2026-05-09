import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { query } from "../../../../core/shared/postgres.js";
import { ensureDirectory, resolveCdnPath, sanitizeFilePart } from "../../../../core/shared/storage.js";
import { rowToRecord } from "../record.js";
import { selectUtilitySql } from "./select-sql.js";
import { removeUtilityFiles, syncUtilityLegacyBillFiles } from "./file-repository.js";

async function getCompanyDirectoryName(companyId) {
  const result = await query(
    `SELECT short_name, name FROM companies WHERE id = $1 LIMIT 1`,
    [companyId],
  );
  const row = result.rows[0];
  return sanitizeFilePart(row?.short_name || row?.name || `company-${companyId}`);
}

export async function replaceUtilityAttachment(record, attachment, userDbId) {
  await removeUtilityFiles(record.id);
  const now = new Date();
  const year = record.periodStart.slice(0, 4) || String(now.getFullYear());
  const month = record.periodStart.slice(5, 7) || String(now.getMonth() + 1).padStart(2, "0");
  const companyDir = await getCompanyDirectoryName(record.facilityId);
  const storedName = ["utilities", sanitizeFilePart(record.type), String(record.id), now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14), randomUUID().slice(0, 8)].join("_") + ".pdf";
  const relativeDir = ["utilities", companyDir, sanitizeFilePart(record.type), year, month].join("/");
  const relativePath = `${relativeDir}/${storedName}`;

  await ensureDirectory(resolveCdnPath(relativeDir));
  await writeFile(resolveCdnPath(relativePath), attachment.buffer);
  await query(`INSERT INTO file_assets (module, entity_type, entity_id, company_id, original_name, stored_name, storage_disk, storage_path, mime_type, file_size, uploaded_by_user_id) VALUES ('utilities', 'utility_record', $1, $2, $3, $4, 'local-cdn', $5, $6, $7, $8)`, [record.id, record.facilityId, attachment.fileName, storedName, relativePath, attachment.mimeType, attachment.buffer.length, userDbId]);
  await syncUtilityLegacyBillFiles(record.id);

  const updated = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
  return rowToRecord(updated.rows[0]);
}
