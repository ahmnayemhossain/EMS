import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectWastewaterSql = `
  SELECT
    wlr.*,
    latest_file.id AS lab_report_id,
    latest_file.original_name AS lab_report_original_name,
    latest_file.stored_name AS lab_report_stored_name,
    latest_file.mime_type AS lab_report_mime_type,
    latest_file.file_size AS lab_report_file_size,
    latest_file.storage_path AS lab_report_storage_path,
    latest_file.url AS lab_report_url,
    latest_file.uploaded_at AS lab_report_uploaded_at
  FROM wastewater_lab_records wlr
  LEFT JOIN LATERAL (
    SELECT
      fa.id,
      fa.original_name,
      fa.stored_name,
      fa.mime_type,
      fa.file_size,
      fa.storage_path,
      '${toCdnUrl("")}' || fa.storage_path AS url,
      fa.created_at AS uploaded_at
    FROM file_assets fa
    WHERE fa.module = 'wastewater' AND fa.entity_type = 'wastewater_lab_record' AND fa.entity_id = wlr.id
    ORDER BY fa.created_at DESC
    LIMIT 1
  ) latest_file ON true
`;
