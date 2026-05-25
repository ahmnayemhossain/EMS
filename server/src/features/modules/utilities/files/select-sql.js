import { toCdnUrl } from "../../../../core/shared/storage.js";

export const selectUtilitySql = `
  SELECT ur.*, f.name AS facility_name, s.name AS source_name,
    m.code AS meter_code, m.location AS meter_location,
    cu.username AS created_by_username, uu.username AS updated_by_username,
    mucu.username AS monthly_created_by_username, mue.name AS monthly_created_by_name,
    uma.id AS monthly_approval_id, uma.coverage_start, uma.coverage_end,
    uma.covered_days, uma.month_days, uma.missing_ranges, uma.missing_days_count,
    uma.record_count AS month_record_count, uma.total_value AS month_total_value,
    uma.total_diesel_liters AS month_total_diesel_liters, uma.approval_status,
    uma.approved_at, au.username AS approved_by_username, ae.name AS approved_by_name,
    uma.created_at AS monthly_created_at,
    COALESCE(approval_history.events, '[]'::jsonb) AS approval_history,
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
  LEFT JOIN users mucu ON mucu.id = uma.created_by_user_id
  LEFT JOIN employees mue ON mue.id = mucu.employee_id
  LEFT JOIN users au ON au.id = uma.approved_by_user_id
  LEFT JOIN employees ae ON ae.id = au.employee_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', uah.id,
        'fromStepKey', uah.from_status,
        'toStepKey', uah.to_status,
        'actedBy', COALESCE(he.name, hu.username),
        'actedAt', uah.created_at
      )
      ORDER BY uah.created_at ASC
    ) AS events
    FROM utility_monthly_approval_history uah
    LEFT JOIN users hu ON hu.id = uah.actor_user_id
    LEFT JOIN employees he ON he.id = hu.employee_id
    WHERE uah.monthly_approval_id = uma.id
  ) approval_history ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(jsonb_build_object('id', fa.id, 'name', fa.original_name, 'storedName', fa.stored_name, 'mimeType', fa.mime_type, 'fileSize', fa.file_size, 'storagePath', fa.storage_path, 'url', '${toCdnUrl("")}' || fa.storage_path, 'uploadedAt', fa.created_at) ORDER BY fa.created_at DESC) AS files
    FROM file_assets fa
    WHERE fa.module = 'utilities' AND fa.entity_type = 'utility_record' AND fa.entity_id = ur.id
  ) file_assets ON true
`;
