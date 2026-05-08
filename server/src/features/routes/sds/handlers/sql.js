import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectSdsSql = `
  SELECT
    sr.*,
    COALESCE(sections.sections, '[]'::jsonb) AS sections,
    COALESCE(files.files, '[]'::jsonb) AS files
  FROM sds_records sr
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object('id', ss.section_no::text, 'title', ss.title, 'summary', ss.summary)
      ORDER BY ss.section_no ASC
    ) AS sections
    FROM sds_sections ss
    WHERE ss.sds_id = sr.id
  ) sections ON true
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
    WHERE fa.module = 'sds' AND fa.entity_type = 'sds_record' AND fa.entity_id = sr.id
  ) files ON true
`;

