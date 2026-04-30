import { query } from "../../../../core/shared/postgres.js";
import { removeFileIfExists, resolveCdnPath, toCdnUrl } from "../../../../core/shared/storage.js";

export async function loadUtilityFiles(recordId) {
  const result = await query(`SELECT * FROM file_assets WHERE module = 'utilities' AND entity_type = 'utility_record' AND entity_id = $1 ORDER BY created_at DESC`, [recordId]);
  return result.rows;
}

export async function syncUtilityLegacyBillFiles(recordId) {
  await query(
    `UPDATE utility_records ur SET bill_files = COALESCE((SELECT jsonb_agg(jsonb_build_object('id', fa.id, 'name', fa.original_name, 'storedName', fa.stored_name, 'mimeType', fa.mime_type, 'fileSize', fa.file_size, 'storagePath', fa.storage_path, 'url', $2 || fa.storage_path, 'uploadedAt', fa.created_at) ORDER BY fa.created_at DESC) FROM file_assets fa WHERE fa.module = 'utilities' AND fa.entity_type = 'utility_record' AND fa.entity_id = $1), '[]'::jsonb), updated_at = NOW() WHERE ur.id = $1`,
    [recordId, toCdnUrl("")],
  );
}

export async function removeUtilityFiles(recordId) {
  const files = await loadUtilityFiles(recordId);
  for (const file of files) await removeFileIfExists(resolveCdnPath(file.storage_path));
  await query(`DELETE FROM file_assets WHERE module = 'utilities' AND entity_type = 'utility_record' AND entity_id = $1`, [recordId]);
  await syncUtilityLegacyBillFiles(recordId);
}
