import { query } from "../../../../core/shared/postgres.js";
import { buildUtilityMeterKey, createHttpError, toDateString } from "../record.js";

async function findOverlappingRecord(record, companyId, excludeId) {
  const params = [companyId, record.type, buildUtilityMeterKey(record), record.periodStart, record.periodEnd];
  const excludeClause = excludeId ? `AND id <> $6` : "";
  if (excludeId) params.push(excludeId);

  const result = await query(
    `SELECT id, period_start, period_end, meter_name FROM utility_records WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_start <= $5::date AND period_end >= $4::date ${excludeClause} ORDER BY period_start DESC LIMIT 1`,
    params,
  );

  return result.rows[0] || null;
}

export async function assertNoDateRangeOverlap(record, companyId, excludeId) {
  const overlap = await findOverlappingRecord(record, companyId, excludeId);
  if (!overlap) return;

  throw createHttpError(409, `An entry already exists for this company, utility type, meter, and date range (${toDateString(overlap.period_start)} to ${toDateString(overlap.period_end)}).`);
}
