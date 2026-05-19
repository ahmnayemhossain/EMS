import { query } from "../../../core/shared/postgres.js";
import { createHttpError } from "./record/error.js";
import { toDateString } from "./record/parsers.js";

function startOfMonth(value) {
  return new Date(`${toDateString(value)}T00:00:00Z`);
}

function endOfMonth(value) {
  const date = startOfMonth(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function addDays(value, days) {
  const date = new Date(`${toDateString(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function diffDaysInclusive(start, end) {
  const ms = new Date(`${toDateString(end)}T00:00:00Z`).getTime() - new Date(`${toDateString(start)}T00:00:00Z`).getTime();
  return Math.floor(ms / 86400000) + 1;
}

export function buildUtilityMeterKey(input) {
  if (input?.meterId) return `meter:${input.meterId}`;
  return `name:${String(input?.meterName || "").trim().toLowerCase()}`;
}

export function assertSingleMonthPeriod(record) {
  const monthStart = toDateString(record.periodStart).slice(0, 7);
  const monthEnd = toDateString(record.periodEnd).slice(0, 7);
  if (monthStart !== monthEnd) {
    throw createHttpError(400, "One utility entry cannot span more than one month.");
  }
}

function buildCoverage(rows, periodMonth) {
  const monthStart = startOfMonth(periodMonth);
  const monthEnd = endOfMonth(periodMonth);
  const records = rows
    .map((row) => ({
      start: toDateString(row.period_start),
      end: toDateString(row.period_end),
      value: Number(row.value || 0),
      dieselLiters: row.diesel_liters == null ? null : Number(row.diesel_liters),
      uom: row.uom || null,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
  const missingRanges = [];
  let cursor = toDateString(monthStart);

  for (const record of records) {
    if (record.start > cursor) {
      missingRanges.push({ start: cursor, end: toDateString(addDays(record.start, -1)) });
    }
    const nextCursor = addDays(record.end, 1);
    if (toDateString(nextCursor) > cursor) cursor = toDateString(nextCursor);
  }

  if (cursor <= toDateString(monthEnd)) {
    missingRanges.push({ start: cursor, end: toDateString(monthEnd) });
  }

  const missingDaysCount = missingRanges.reduce((sum, item) => sum + diffDaysInclusive(item.start, item.end), 0);

  return {
    coverageStart: records[0]?.start || null,
    coverageEnd: records[records.length - 1]?.end || null,
    coveredDays: records.reduce((sum, item) => sum + diffDaysInclusive(item.start, item.end), 0),
    monthDays: diffDaysInclusive(monthStart, monthEnd),
    missingRanges,
    missingDaysCount,
    isComplete: records.length > 0 && missingDaysCount === 0 && records[0].start === toDateString(monthStart) && records[records.length - 1].end === toDateString(monthEnd),
    totalValue: rows.reduce((sum, row) => sum + Number(row.value || 0), 0),
    totalDieselLiters: rows.every((row) => row.diesel_liters == null) ? null : rows.reduce((sum, row) => sum + Number(row.diesel_liters || 0), 0),
    uom: records.find((item) => item.uom)?.uom || null,
  };
}

export async function syncUtilityMonthlyApproval(input) {
  const result = await query(
    `SELECT id, facility_id, type, meter_id, meter_key, meter_name, source_id, period_month, period_start, period_end, value, diesel_liters, uom
       FROM utility_records
      WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4
      ORDER BY period_start ASC, id ASC`,
    [input.facilityId, input.type, input.meterKey, input.periodMonth],
  );

  if (!result.rowCount) {
    await query(
      `DELETE FROM utility_monthly_approvals
        WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4`,
      [input.facilityId, input.type, input.meterKey, input.periodMonth],
    );
    return null;
  }

  const firstRow = result.rows[0];
  const coverage = buildCoverage(result.rows, input.periodMonth);

  await query(
    `INSERT INTO utility_monthly_approvals
      (facility_id, type, meter_id, meter_key, meter_name, source_id, period_month, coverage_start, coverage_end, covered_days, month_days, missing_ranges, missing_days_count, record_count, total_value, total_diesel_liters, uom, approval_status, approved_by_user_id, approved_at, created_by_user_id, updated_by_user_id, created_at, updated_at)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,'pending',NULL,NULL,$18,$18,NOW(),NOW())
     ON CONFLICT (facility_id, type, meter_key, period_month) DO UPDATE SET
      meter_id = EXCLUDED.meter_id,
      meter_name = EXCLUDED.meter_name,
      source_id = EXCLUDED.source_id,
      coverage_start = EXCLUDED.coverage_start,
      coverage_end = EXCLUDED.coverage_end,
      covered_days = EXCLUDED.covered_days,
      month_days = EXCLUDED.month_days,
      missing_ranges = EXCLUDED.missing_ranges,
      missing_days_count = EXCLUDED.missing_days_count,
      record_count = EXCLUDED.record_count,
      total_value = EXCLUDED.total_value,
      total_diesel_liters = EXCLUDED.total_diesel_liters,
      uom = EXCLUDED.uom,
      approval_status = CASE
        WHEN utility_monthly_approvals.coverage_start IS NOT DISTINCT FROM EXCLUDED.coverage_start
         AND utility_monthly_approvals.coverage_end IS NOT DISTINCT FROM EXCLUDED.coverage_end
         AND utility_monthly_approvals.record_count = EXCLUDED.record_count
         AND utility_monthly_approvals.total_value = EXCLUDED.total_value
         AND utility_monthly_approvals.missing_days_count = EXCLUDED.missing_days_count
        THEN utility_monthly_approvals.approval_status
        ELSE 'draft'
      END,
      approved_by_user_id = CASE
        WHEN utility_monthly_approvals.approval_status = 'approved'
         AND utility_monthly_approvals.coverage_start IS NOT DISTINCT FROM EXCLUDED.coverage_start
         AND utility_monthly_approvals.coverage_end IS NOT DISTINCT FROM EXCLUDED.coverage_end
         AND utility_monthly_approvals.record_count = EXCLUDED.record_count
         AND utility_monthly_approvals.total_value = EXCLUDED.total_value
         AND utility_monthly_approvals.missing_days_count = EXCLUDED.missing_days_count
        THEN utility_monthly_approvals.approved_by_user_id
        ELSE NULL
      END,
      approved_at = CASE
        WHEN utility_monthly_approvals.approval_status = 'approved'
         AND utility_monthly_approvals.coverage_start IS NOT DISTINCT FROM EXCLUDED.coverage_start
         AND utility_monthly_approvals.coverage_end IS NOT DISTINCT FROM EXCLUDED.coverage_end
         AND utility_monthly_approvals.record_count = EXCLUDED.record_count
         AND utility_monthly_approvals.total_value = EXCLUDED.total_value
         AND utility_monthly_approvals.missing_days_count = EXCLUDED.missing_days_count
        THEN utility_monthly_approvals.approved_at
        ELSE NULL
      END,
      updated_by_user_id = EXCLUDED.updated_by_user_id,
      updated_at = NOW()`,
    [
      input.facilityId,
      input.type,
      firstRow.meter_id,
      input.meterKey,
      firstRow.meter_name,
      firstRow.source_id,
      input.periodMonth,
      coverage.coverageStart,
      coverage.coverageEnd,
      coverage.coveredDays,
      coverage.monthDays,
      JSON.stringify(coverage.missingRanges),
      coverage.missingDaysCount,
      result.rowCount,
      coverage.totalValue,
      coverage.totalDieselLiters,
      coverage.uom,
      input.userId || null,
    ],
  );

  return coverage;
}

export async function syncAllUtilityMonthlyApprovals() {
  const result = await query(
    `SELECT DISTINCT facility_id, type, meter_key, period_month
       FROM utility_records
      WHERE meter_key IS NOT NULL AND period_month IS NOT NULL`,
  );
  for (const row of result.rows) {
    await syncUtilityMonthlyApproval({
      facilityId: Number(row.facility_id),
      type: row.type,
      meterKey: row.meter_key,
      periodMonth: toDateString(row.period_month),
      userId: null,
    });
  }
}

export async function approveUtilityMonthByRecordId(input) {
  const recordRes = await query(
    `SELECT id, facility_id, type, meter_key, period_month
       FROM utility_records
      WHERE id = $1
        AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = utility_records.facility_id)`,
    [input.recordId, input.userId || -1],
  );
  const record = recordRes.rows[0];
  if (!record) throw createHttpError(404, "Utility record not found.");

  const approvalRes = await query(
    `SELECT id, missing_days_count, record_count, approval_status
       FROM utility_monthly_approvals
      WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4`,
    [record.facility_id, record.type, record.meter_key, record.period_month],
  );
  const approval = approvalRes.rows[0];
  if (!approval) throw createHttpError(404, "Monthly utility aggregate not found.");
  if (Number(approval.record_count || 0) <= 0) throw createHttpError(400, "No monthly utility data found for approval.");
  if (Number(approval.missing_days_count || 0) > 0) throw createHttpError(409, "This month has missing day coverage. Complete the month before approval.");
  if (String(approval.approval_status || "") !== "submitted") throw createHttpError(409, "Submit the full month first before approval.");

  await query(
    `UPDATE utility_monthly_approvals
        SET approval_status = 'approved',
            approved_by_user_id = $2,
            approved_at = NOW(),
            updated_by_user_id = $2,
            updated_at = NOW()
      WHERE id = $1`,
    [approval.id, input.userId],
  );

  return record;
}

export async function submitUtilityMonthByRecordId(input) {
  const recordRes = await query(
    `SELECT id, facility_id, type, meter_key, period_month
       FROM utility_records
      WHERE id = $1
        AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = utility_records.facility_id)`,
    [input.recordId, input.userId || -1],
  );
  const record = recordRes.rows[0];
  if (!record) throw createHttpError(404, "Utility record not found.");

  const approvalRes = await query(
    `SELECT *
       FROM utility_monthly_approvals
      WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4`,
    [record.facility_id, record.type, record.meter_key, record.period_month],
  );
  const approval = approvalRes.rows[0];
  if (!approval) throw createHttpError(404, "Monthly utility aggregate not found.");
  if (String(approval.approval_status || "") === "approved") throw createHttpError(409, "This month is already approved.");
  if (String(approval.approval_status || "") === "submitted") throw createHttpError(409, "This month is already submitted for approval.");
  if (Number(approval.record_count || 0) <= 0) throw createHttpError(400, "No monthly utility data found for submission.");
  if (Number(approval.missing_days_count || 0) > 0) throw createHttpError(409, "This month has missing day coverage. Complete the month before submission.");
  if (
    !approval.coverage_start ||
    !approval.coverage_end ||
    toDateString(approval.coverage_start) !== toDateString(record.period_month) ||
    toDateString(approval.coverage_end) !== toDateString(endOfMonth(record.period_month))
  ) {
    throw createHttpError(409, "Only full-month utility data can be submitted.");
  }

  await query(
    `UPDATE utility_monthly_approvals
        SET approval_status = 'submitted',
            updated_by_user_id = $2,
            updated_at = NOW()
      WHERE id = $1`,
    [approval.id, input.userId],
  );

  return approval;
}
