import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectUtilitySql = `
  SELECT ur.*, f.name AS facility_name, s.name AS source_name,
    m.code AS meter_code, m.location AS meter_location,
    cu.username AS created_by_username, uu.username AS updated_by_username,
    COALESCE(file_assets.files, ur.bill_files, '[]'::jsonb) AS bill_files
  FROM utility_records ur
  JOIN companies f ON f.id = ur.facility_id
  LEFT JOIN sources s ON s.id = ur.source_id
  LEFT JOIN meters m ON m.id = ur.meter_id
  LEFT JOIN users cu ON cu.id = ur.created_by_user_id
  LEFT JOIN users uu ON uu.id = ur.updated_by_user_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(jsonb_build_object('id', fa.id, 'name', fa.original_name, 'storedName', fa.stored_name, 'mimeType', fa.mime_type, 'fileSize', fa.file_size, 'storagePath', fa.storage_path, 'url', '${toCdnUrl("")}' || fa.storage_path, 'uploadedAt', fa.created_at) ORDER BY fa.created_at DESC) AS files
    FROM file_assets fa
    WHERE fa.module = 'utilities' AND fa.entity_type = 'utility_record' AND fa.entity_id = ur.id
  ) file_assets ON true
`;
