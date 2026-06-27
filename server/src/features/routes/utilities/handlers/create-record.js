import { query } from "../../../../core/shared/postgres.js";
import { assertNoDateRangeOverlap, assertUserCompanyAccess, isAllowedSource, isAllowedUom } from "../../../modules/utilities/access.js";
import { assertSingleMonthPeriod, buildUtilityMeterKey, createHttpError, normalizeRecordInput, rowToRecord } from "../../../modules/utilities/record.js";
import { resolveUtilityMeter } from "../../../modules/utilities/meters/resolve-meter.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { syncUtilityMonthlyApproval } from "../../../modules/utilities/monthly-approval.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

export async function createUtilityRecord(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const record = normalizeRecordInput(req.body || {});
    assertSingleMonthPeriod(record);
    const companyDbId = await getCompanyDbIdOrThrow(record.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const meter = await resolveUtilityMeter({
      meterId: record.meterId,
      companyDbId,
      type: record.type,
    });

    const uom = meter.uom;
    const sourceId = meter.sourceId;

    const value = record.value;
    let dieselLiters = record.dieselLiters ?? null;
    let calcMethod = null;
    let calcFactor = null;
    if (typeof dieselLiters !== "number" || !Number.isFinite(dieselLiters)) dieselLiters = null;

    if (!(await isAllowedUom(record.type, uom))) throw createHttpError(400, "Invalid utility UOM.");
    if (!(await isAllowedSource(record.type, sourceId))) throw createHttpError(400, "Invalid utility source.");
    await assertNoDateRangeOverlap(record, companyDbId);
    const meterKey = buildUtilityMeterKey({ meterId: meter.id, meterName: meter.name });
    const periodMonth = `${record.periodStart.slice(0, 7)}-01`;

    const result = await query(
      `INSERT INTO utility_records (facility_id, type, meter_id, meter_key, source_id, period_start, period_end, period_month, meter_name, diesel_liters, calc_method, calc_factor, previous_reading, current_reading, uom, value, baseline_value, min_threshold, max_threshold, variance, variance_percent, variance_flag, status, remarks, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $25) RETURNING *`,
      [companyDbId, record.type, meter.id, meterKey, sourceId, record.periodStart, record.periodEnd, periodMonth, meter.name, dieselLiters, calcMethod, calcFactor, record.previousReading, record.currentReading, uom, value, record.baselineValue, record.minThreshold, record.maxThreshold, record.variance, record.variancePercent, record.varianceFlag, record.status, record.remarks, userDbId],
    );
    await syncUtilityMonthlyApproval({
      facilityId: companyDbId,
      type: record.type,
      meterKey,
      periodMonth,
      userId: userDbId,
    });
    const created = await query(`${selectUtilitySql} WHERE ur.id = $1`, [result.rows[0].id]);
    res.status(201).json(rowToRecord(created.rows[0]));
  } catch (error) {
    next(error);
  }
}
