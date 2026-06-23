import { toDateString } from "./parsers.js";

function toNumber(value) {
  if (value === null || typeof value === "undefined") return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

export function rowToRecord(row) {
  const missingRanges = Array.isArray(row.missing_ranges) ? row.missing_ranges : [];
  const approvalHistory = Array.isArray(row.approval_history) ? row.approval_history : [];
  const rawApprovalStatus = String(row.approval_status || "").trim().toLowerCase();
  const approvalStatus =
    rawApprovalStatus === "pending"
      ? "draft"
      : rawApprovalStatus === "checked" || rawApprovalStatus === "recommended"
        ? "submitted"
        : rawApprovalStatus || "draft";
  return {
    id: Number(row.id),
    facilityId: String(row.facility_id),
    type: row.type,
    meterId: row.meter_id ? Number(row.meter_id) : undefined,
    meterKey: row.meter_key || undefined,
    meterCode: row.meter_code || undefined,
    meterLocation: row.meter_location || undefined,
    sourceId: row.source_id ? String(row.source_id) : undefined,
    sourceName: row.source_name || undefined,
    periodStart: toDateString(row.period_start),
    periodEnd: toDateString(row.period_end),
    periodMonth: toDateString(row.period_month),
    meterName: row.meter_name,
    dieselLiters: toNumber(row.diesel_liters),
    calcMethod: row.calc_method || undefined,
    calcFactor: toNumber(row.calc_factor),
    previousReading: toNumber(row.previous_reading),
    currentReading: toNumber(row.current_reading),
    uom: row.uom,
    value: Number(row.value),
    baselineValue: toNumber(row.baseline_value),
    minThreshold: toNumber(row.min_threshold),
    maxThreshold: toNumber(row.max_threshold),
    variance: toNumber(row.variance),
    variancePercent: toNumber(row.variance_percent),
    varianceFlag: row.variance_flag || undefined,
    status: row.status || undefined,
    remarks: row.remarks || undefined,
    billFiles: Array.isArray(row.bill_files) ? row.bill_files : [],
    monthlyApprovalId: row.monthly_approval_id ? Number(row.monthly_approval_id) : undefined,
    approvalStatus,
    approvedBy: row.approved_by_name || row.approved_by_username || undefined,
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : undefined,
    monthlyCreatedBy: row.monthly_created_by_name || row.monthly_created_by_username || undefined,
    monthlyCreatedAt: row.monthly_created_at ? new Date(row.monthly_created_at).toISOString() : undefined,
    coverageStart: row.coverage_start ? toDateString(row.coverage_start) : undefined,
    coverageEnd: row.coverage_end ? toDateString(row.coverage_end) : undefined,
    coverageDays: toNumber(row.covered_days),
    monthDays: toNumber(row.month_days),
    missingRanges,
    missingDaysCount: toNumber(row.missing_days_count) ?? 0,
    monthRecordCount: toNumber(row.month_record_count),
    monthTotalValue: toNumber(row.month_total_value),
    monthTotalDieselLiters: toNumber(row.month_total_diesel_liters),
    monthComplete:
      approvalStatus === "approved" || ((toNumber(row.missing_days_count) ?? 0) === 0 && (toNumber(row.month_record_count) ?? 0) > 0),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    approvalHistory,
  };
}

export function rowToUomOption(row) {
  return { id: String(row.id), name: row.name, utilityType: row.utility_type_key };
}
