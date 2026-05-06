import { toDateString } from "./parsers.js";

function toNumber(value) {
  if (value === null || typeof value === "undefined") return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

export function rowToRecord(row) {
  return {
    id: Number(row.id),
    facilityId: String(row.facility_id),
    type: row.type,
    meterId: row.meter_id ? Number(row.meter_id) : undefined,
    meterCode: row.meter_code || undefined,
    meterLocation: row.meter_location || undefined,
    sourceId: row.source_id ? String(row.source_id) : undefined,
    sourceName: row.source_name || undefined,
    periodStart: toDateString(row.period_start),
    periodEnd: toDateString(row.period_end),
    meterName: row.meter_name,
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
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
  };
}

export function rowToUomOption(row) {
  return { id: String(row.id), name: row.name, utilityType: row.utility_type_key };
}
