import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectChemicalsSql = `
  SELECT
    c.*,
    co.name AS facility_name,
    sr.chemical_name AS sds_chemical_name,
    sr.supplier AS sds_supplier,
    sr.language AS sds_language,
    sr.revision_date AS sds_revision_date,
    COALESCE(sds_files.files, '[]'::jsonb) AS sds_files
  FROM chemicals c
  JOIN companies co ON co.id = c.facility_id
  LEFT JOIN sds_records sr ON sr.id = c.sds_id
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
    WHERE fa.module = 'sds' AND fa.entity_type = 'sds_record' AND fa.entity_id = c.sds_id
  ) sds_files ON true
`;
