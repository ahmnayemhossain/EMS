import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectDocumentsSql = `
  SELECT
    dr.*,
    co.name AS company_name,
    COALESCE(ce.name, cu.username) AS uploaded_by,
    latest_file.url AS file_url,
    latest_file.mime_type AS mime_type,
    latest_file.file_size AS file_size,
    latest_file.uploaded_at AS file_uploaded_at
  FROM document_records dr
  JOIN companies co ON co.id = dr.facility_id
  LEFT JOIN users cu ON cu.id = dr.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN LATERAL (
    SELECT
      '${toCdnUrl("")}' || fa.storage_path AS url,
      fa.mime_type,
      fa.file_size,
      fa.created_at AS uploaded_at
    FROM file_assets fa
    WHERE fa.module = 'documents' AND fa.entity_type = 'document_record' AND fa.entity_id = dr.id
    ORDER BY fa.created_at DESC
    LIMIT 1
  ) latest_file ON true
`;
