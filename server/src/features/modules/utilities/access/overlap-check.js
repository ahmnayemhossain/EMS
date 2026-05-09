import { query } from "../../../../core/shared/postgres.js";
import { createHttpError, toDateString } from "../record.js";

async function findOverlappingRecord(record, companyId, excludeId) {
  const normalizedMeterName = String(record.meterName || "").trim().toLowerCase();
  const params = [companyId, record.type, record.meterId || null, normalizedMeterName, record.periodStart, record.periodEnd];
  const excludeClause = excludeId ? `AND id <> $7` : "";
  if (excludeId) params.push(excludeId);

  const result = await query(
    `SELECT id, period_start, period_end, meter_name
       FROM utility_records
      WHERE facility_id = $1
        AND type = $2
        AND (
          ($3::int IS NOT NULL AND meter_id = $3)
          OR
          (($3::int IS NULL OR meter_id IS NULL) AND LOWER(TRIM(COALESCE(meter_name, ''))) = $4)
        )
        AND period_start <= $6::date
        AND period_end >= $5::date
        ${excludeClause}
      ORDER BY period_start DESC
      LIMIT 1`,
    params,
  );

  return result.rows[0] || null;
}

export async function assertNoDateRangeOverlap(record, companyId, excludeId) {
  const overlap = await findOverlappingRecord(record, companyId, excludeId);
  if (!overlap) return;

  throw createHttpError(409, `An entry already exists for this company, utility type, meter, and date range (${toDateString(overlap.period_start)} to ${toDateString(overlap.period_end)}).`);
}
