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

export async function updateUtilityRecord(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const record = normalizeRecordInput({ ...req.body, id: req.params.id });
    assertSingleMonthPeriod(record);
    const companyDbId = await getCompanyDbIdOrThrow(record.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);
    const existingRes = await query(`SELECT facility_id, type, meter_key, period_month FROM utility_records WHERE id = $1`, [record.id]);
    if (!existingRes.rowCount) return res.status(404).json({ error: "not_found" });
    const existing = existingRes.rows[0];

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
    await assertNoDateRangeOverlap(record, companyDbId, record.id);
    const meterKey = buildUtilityMeterKey({ meterId: meter ? meter.id : null, meterName: record.meterName });
    const periodMonth = `${record.periodStart.slice(0, 7)}-01`;

    const result = await query(
      `UPDATE utility_records SET facility_id = $2, type = $3, meter_id = $4, meter_key = $5, source_id = $6, period_start = $7, period_end = $8, period_month = $9, meter_name = $10, diesel_liters = $11, calc_method = $12, calc_factor = $13, previous_reading = $14, current_reading = $15, uom = $16, value = $17, baseline_value = $18, min_threshold = $19, max_threshold = $20, variance = $21, variance_percent = $22, variance_flag = $23, status = $24, remarks = $25, updated_by_user_id = $26, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [record.id, companyDbId, record.type, meter ? meter.id : null, meterKey, sourceId, record.periodStart, record.periodEnd, periodMonth, record.meterName, dieselLiters, calcMethod, calcFactor, record.previousReading, record.currentReading, uom, value, record.baselineValue, record.minThreshold, record.maxThreshold, record.variance, record.variancePercent, record.varianceFlag, record.status, record.remarks, userDbId],
    );
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    await syncUtilityMonthlyApproval({
      facilityId: companyDbId,
      type: record.type,
      meterKey,
      periodMonth,
      userId: userDbId,
    });
    if (
      Number(existing.facility_id) !== companyDbId ||
      existing.type !== record.type ||
      existing.meter_key !== meterKey ||
      String(existing.period_month).slice(0, 10) !== periodMonth
    ) {
      await syncUtilityMonthlyApproval({
        facilityId: Number(existing.facility_id),
        type: existing.type,
        meterKey: existing.meter_key,
        periodMonth: String(existing.period_month).slice(0, 10),
        userId: userDbId,
      });
    }
    const updated = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
    res.json(rowToRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}
