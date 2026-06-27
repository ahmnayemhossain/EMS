import { query } from "../../../core/shared/postgres.js";
import { createHttpError } from "./record/error.js";
import { toDateString } from "./record/parsers.js";

const WORKFLOW_KEY = "utilities_approval_flow";
const ENTITY_TYPE = "utility_period";

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

function sameNumber(left, right) {
  if (left == null && right == null) return true;
  return Number(left || 0) === Number(right || 0);
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
    totalValue: rows.reduce((sum, row) => sum + Number(row.value || 0), 0),
    totalDieselLiters: rows.every((row) => row.diesel_liters == null) ? null : rows.reduce((sum, row) => sum + Number(row.diesel_liters || 0), 0),
    uom: records.find((item) => item.uom)?.uom || null,
  };
}

async function getInitialWorkflowStepKey() {
  const result = await query(
    `SELECT key
       FROM workflow_steps
      WHERE workflow_key = $1
        AND is_initial = 1
        AND is_active = 1
      ORDER BY sort_order ASC, name ASC
      LIMIT 1`,
    [WORKFLOW_KEY],
  );
  return result.rows[0]?.key || "draft";
}

async function deleteUtilityPeriodAggregate({ facilityId, type, meterKey, periodMonth }) {
  const existingRes = await query(
    `SELECT id
       FROM utility_periods
      WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4`,
    [facilityId, type, meterKey, periodMonth],
  );
  const periodId = existingRes.rows[0]?.id;
  if (!periodId) return;

  await query(
    `DELETE FROM workflow_events
      WHERE workflow_instance_id IN (
        SELECT id
          FROM workflow_instances
         WHERE workflow_key = $1
           AND entity_type = $2
           AND entity_id = $3
      )`,
    [WORKFLOW_KEY, ENTITY_TYPE, periodId],
  );
  await query(
    `DELETE FROM workflow_instances
      WHERE workflow_key = $1
        AND entity_type = $2
        AND entity_id = $3`,
    [WORKFLOW_KEY, ENTITY_TYPE, periodId],
  );
  await query(`DELETE FROM utility_periods WHERE id = $1`, [periodId]);
}

function hasAggregateChanged(existing, nextCoverage, rowCount, firstRow) {
  return !(
    toDateString(existing.coverage_start) === String(nextCoverage.coverageStart || "") &&
    toDateString(existing.coverage_end) === String(nextCoverage.coverageEnd || "") &&
    Number(existing.record_count || 0) === Number(rowCount || 0) &&
    sameNumber(existing.total_value, nextCoverage.totalValue) &&
    sameNumber(existing.total_diesel_liters, nextCoverage.totalDieselLiters) &&
    Number(existing.missing_days_count || 0) === Number(nextCoverage.missingDaysCount || 0) &&
    Number(existing.covered_days || 0) === Number(nextCoverage.coveredDays || 0) &&
    Number(existing.month_days || 0) === Number(nextCoverage.monthDays || 0) &&
    String(existing.uom || "") === String(nextCoverage.uom || "") &&
    String(existing.meter_name || "") === String(firstRow.meter_name || "") &&
    Number(existing.meter_id || 0) === Number(firstRow.meter_id || 0) &&
    Number(existing.source_id || 0) === Number(firstRow.source_id || 0)
  );
}

async function ensureWorkflowInstance({ periodId, facilityId, actorUserId, initialStepKey, currentStepKey }) {
  const existingRes = await query(
    `SELECT id, current_step_key
       FROM workflow_instances
      WHERE workflow_key = $1
        AND entity_type = $2
        AND entity_id = $3`,
    [WORKFLOW_KEY, ENTITY_TYPE, periodId],
  );
  const existing = existingRes.rows[0];
  if (existing) {
    if (currentStepKey && currentStepKey !== existing.current_step_key) {
      await query(
        `UPDATE workflow_instances
            SET current_step_key = $2,
                updated_by_user_id = $3::bigint,
                updated_at = NOW()
          WHERE id = $1`,
        [existing.id, currentStepKey, actorUserId],
      );
    }
    return existing;
  }

  const insertRes = await query(
    `INSERT INTO workflow_instances
      (workflow_key, entity_type, entity_id, current_step_key, company_id, created_by_user_id, updated_by_user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::bigint, $6::bigint, NOW(), NOW())
     RETURNING id, current_step_key`,
    [WORKFLOW_KEY, ENTITY_TYPE, periodId, currentStepKey || initialStepKey, facilityId, actorUserId],
  );
  return insertRes.rows[0];
}

export async function syncUtilityMonthlyApproval(input) {
  const actorUserId =
    input.userId == null || input.userId === ""
      ? null
      : Number(input.userId);
  if (actorUserId != null && (!Number.isFinite(actorUserId) || actorUserId <= 0)) {
    throw createHttpError(400, "Invalid utility approval user context.");
  }

  const result = await query(
    `SELECT id, facility_id, type, meter_id, meter_key, meter_name, source_id, period_month, period_start, period_end, value, diesel_liters, uom
       FROM utility_records
      WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4
      ORDER BY period_start ASC, id ASC`,
    [input.facilityId, input.type, input.meterKey, input.periodMonth],
  );

  if (!result.rowCount) {
    await deleteUtilityPeriodAggregate(input);
    return null;
  }

  const firstRow = result.rows[0];
  const coverage = buildCoverage(result.rows, input.periodMonth);
  const existingRes = await query(
    `SELECT up.*, wi.id AS workflow_instance_id, wi.current_step_key
       FROM utility_periods up
       LEFT JOIN workflow_instances wi
         ON wi.workflow_key = $5
        AND wi.entity_type = $6
        AND wi.entity_id = up.id
      WHERE up.facility_id = $1
        AND up.type = $2
        AND up.meter_key = $3
        AND up.period_month = $4`,
    [input.facilityId, input.type, input.meterKey, input.periodMonth, WORKFLOW_KEY, ENTITY_TYPE],
  );

  const existing = existingRes.rows[0];
  const initialStepKey = await getInitialWorkflowStepKey();

  if (!existing) {
    const insertRes = await query(
      `INSERT INTO utility_periods
        (facility_id, type, meter_id, meter_key, meter_name, source_id, period_month, coverage_start, coverage_end, covered_days, month_days, missing_ranges, missing_days_count, record_count, total_value, total_diesel_liters, uom, created_by_user_id, updated_by_user_id, created_at, updated_at)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18::bigint,$18::bigint,NOW(),NOW())
       RETURNING id`,
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
        actorUserId,
      ],
    );
    await ensureWorkflowInstance({
      periodId: insertRes.rows[0].id,
      facilityId: input.facilityId,
      actorUserId,
      initialStepKey,
      currentStepKey: initialStepKey,
    });
    return coverage;
  }

  const aggregateChanged = hasAggregateChanged(existing, coverage, result.rowCount, firstRow);
  await query(
    `UPDATE utility_periods
        SET meter_id = $2,
            meter_name = $3,
            source_id = $4,
            coverage_start = $5,
            coverage_end = $6,
            covered_days = $7,
            month_days = $8,
            missing_ranges = $9::jsonb,
            missing_days_count = $10,
            record_count = $11,
            total_value = $12,
            total_diesel_liters = $13,
            uom = $14,
            updated_by_user_id = $15::bigint,
            updated_at = NOW()
      WHERE id = $1`,
    [
      existing.id,
      firstRow.meter_id,
      firstRow.meter_name,
      firstRow.source_id,
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
      actorUserId,
    ],
  );

  const instance = await ensureWorkflowInstance({
    periodId: existing.id,
    facilityId: input.facilityId,
    actorUserId,
    initialStepKey,
    currentStepKey: existing.current_step_key || initialStepKey,
  });

  if (aggregateChanged && instance.current_step_key && instance.current_step_key !== initialStepKey) {
    await query(
      `UPDATE workflow_instances
          SET current_step_key = $2,
              updated_by_user_id = $3::bigint,
              updated_at = NOW()
        WHERE id = $1`,
      [instance.id, initialStepKey, actorUserId],
    );
    await query(
      `INSERT INTO workflow_events
        (workflow_instance_id, transition_key, from_step_key, to_step_key, actor_user_id, note)
       VALUES ($1, NULL, $2, $3, $4::bigint, $5)`,
      [
        instance.id,
        instance.current_step_key,
        initialStepKey,
        actorUserId,
        "Workflow reset after utility data changed.",
      ],
    );
  }

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
