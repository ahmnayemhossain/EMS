import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectWasteSql = `
  SELECT
    wr.*,
    COALESCE(waste_files.files, '[]'::jsonb) AS files
  FROM waste_records wr
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', fa.id,
        'name', fa.original_name,
        'storedName', fa.stored_name,
        'mimeType', fa.mime_type,
        'fileSize', fa.file_size,
        'storagePath', fa.storage_path,
        'url', '${toCdnUrl("")}' || fa.storage_path,
        'uploadedAt', fa.created_at
      )
      ORDER BY fa.created_at DESC
    ) AS files
    FROM file_assets fa
    WHERE fa.module = 'waste' AND fa.entity_type = 'waste_record' AND fa.entity_id = wr.id
  ) waste_files ON true
`;
