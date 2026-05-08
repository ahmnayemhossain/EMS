import { query } from "../../../../core/shared/postgres.js";
import { assertNoDateRangeOverlap, assertUserCompanyAccess, isAllowedSource, isAllowedUom } from "../../../modules/utilities/access.js";
import { assertSingleMonthPeriod, buildUtilityMeterKey, createHttpError, normalizeRecordInput, rowToRecord } from "../../../modules/utilities/record.js";
import { resolveUtilityMeter } from "../../../modules/utilities/meters/resolve-meter.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { syncUtilityMonthlyApproval } from "../../../modules/utilities/monthly-approval.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

async function getGeneratorDieselFactor(companyDbId) {
  const companyRes = await query(
    `SELECT value FROM utility_conversion_rules WHERE key = $1 AND company_id = $2 AND is_active = 1 LIMIT 1`,
    ["generator_diesel_kwh_per_liter", companyDbId],
  );
  if (companyRes.rows[0]) return Number(companyRes.rows[0].value);
  const globalRes = await query(
    `SELECT value FROM utility_conversion_rules WHERE key = $1 AND company_id IS NULL AND is_active = 1 LIMIT 1`,
    ["generator_diesel_kwh_per_liter"],
  );
  return globalRes.rows[0] ? Number(globalRes.rows[0].value) : null;
}

async function isGeneratorSource(sourceId) {
  if (!sourceId) return false;
  const res = await query(`SELECT name FROM sources WHERE id = $1 LIMIT 1`, [sourceId]);
  return String(res.rows[0]?.name || "").toLowerCase() === "generator";
}

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

    const uom = meter ? meter.uom : record.uom;
    const sourceId = meter ? meter.sourceId : record.sourceId;

    let value = record.value;
    let dieselLiters = record.dieselLiters ?? null;
    let calcMethod = null;
    let calcFactor = null;

    if (record.type === "electricity" && dieselLiters && (await isGeneratorSource(sourceId))) {
      const factor = await getGeneratorDieselFactor(companyDbId);
      if (!factor || !Number.isFinite(factor) || factor <= 0) throw createHttpError(400, "Generator diesel conversion factor is not configured.");
      value = Number(dieselLiters) * Number(factor);
      calcMethod = "diesel_to_kwh";
      calcFactor = Number(factor);
    } else {
      dieselLiters = null;
    }

    if (!(await isAllowedUom(record.type, uom))) throw createHttpError(400, "Invalid utility UOM.");
    if (!(await isAllowedSource(record.type, sourceId))) throw createHttpError(400, "Invalid utility source.");
    await assertNoDateRangeOverlap(record, companyDbId);
    const meterKey = buildUtilityMeterKey({ meterId: meter ? meter.id : null, meterName: record.meterName });
    const periodMonth = `${record.periodStart.slice(0, 7)}-01`;

    const result = await query(
      `INSERT INTO utility_records (facility_id, type, meter_id, meter_key, source_id, period_start, period_end, period_month, meter_name, diesel_liters, calc_method, calc_factor, previous_reading, current_reading, uom, value, baseline_value, min_threshold, max_threshold, variance, variance_percent, variance_flag, status, remarks, created_by_user_id, updated_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $25) RETURNING *`,
      [companyDbId, record.type, meter ? meter.id : null, meterKey, sourceId, record.periodStart, record.periodEnd, periodMonth, record.meterName, dieselLiters, calcMethod, calcFactor, record.previousReading, record.currentReading, uom, value, record.baselineValue, record.minThreshold, record.maxThreshold, record.variance, record.variancePercent, record.varianceFlag, record.status, record.remarks, userDbId],
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
