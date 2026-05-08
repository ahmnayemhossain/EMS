import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectUtilitySql = `
  SELECT ur.*, f.name AS facility_name, s.name AS source_name,
    m.code AS meter_code, m.location AS meter_location,
    cu.username AS created_by_username, uu.username AS updated_by_username,
    uma.id AS monthly_approval_id, uma.coverage_start, uma.coverage_end,
    uma.covered_days, uma.month_days, uma.missing_ranges, uma.missing_days_count,
    uma.record_count AS month_record_count, uma.total_value AS month_total_value,
    uma.total_diesel_liters AS month_total_diesel_liters, uma.approval_status,
    uma.approved_at, au.username AS approved_by_username, ae.name AS approved_by_name,
    COALESCE(file_assets.files, ur.bill_files, '[]'::jsonb) AS bill_files
  FROM utility_records ur
  JOIN companies f ON f.id = ur.facility_id
  LEFT JOIN sources s ON s.id = ur.source_id
  LEFT JOIN meters m ON m.id = ur.meter_id
  LEFT JOIN users cu ON cu.id = ur.created_by_user_id
  LEFT JOIN users uu ON uu.id = ur.updated_by_user_id
  LEFT JOIN utility_monthly_approvals uma
    ON uma.facility_id = ur.facility_id
   AND uma.type = ur.type
   AND uma.meter_key = ur.meter_key
   AND uma.period_month = ur.period_month
  LEFT JOIN users au ON au.id = uma.approved_by_user_id
  LEFT JOIN employees ae ON ae.id = au.employee_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(jsonb_build_object('id', fa.id, 'name', fa.original_name, 'storedName', fa.stored_name, 'mimeType', fa.mime_type, 'fileSize', fa.file_size, 'storagePath', fa.storage_path, 'url', '${toCdnUrl("")}' || fa.storage_path, 'uploadedAt', fa.created_at) ORDER BY fa.created_at DESC) AS files
    FROM file_assets fa
    WHERE fa.module = 'utilities' AND fa.entity_type = 'utility_record' AND fa.entity_id = ur.id
  ) file_assets ON true
`;
