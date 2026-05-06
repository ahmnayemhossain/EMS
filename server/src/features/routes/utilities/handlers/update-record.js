import { query } from "../../../../core/shared/postgres.js";
import { assertNoDateRangeOverlap, assertUserCompanyAccess, isAllowedSource, isAllowedUom } from "../../../modules/utilities/access.js";
import { createHttpError, normalizeRecordInput, rowToRecord } from "../../../modules/utilities/record.js";
import { resolveUtilityMeter } from "../../../modules/utilities/meters/resolve-meter.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

export async function updateUtilityRecord(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const record = normalizeRecordInput({ ...req.body, id: req.params.id });
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

    if (!(await isAllowedUom(record.type, uom))) throw createHttpError(400, "Invalid utility UOM.");
    if (!(await isAllowedSource(record.type, sourceId))) throw createHttpError(400, "Invalid utility source.");
    await assertNoDateRangeOverlap(record, companyDbId, record.id);

    const result = await query(`UPDATE utility_records SET facility_id = $2, type = $3, meter_id = $4, source_id = $5, period_start = $6, period_end = $7, meter_name = $8, previous_reading = $9, current_reading = $10, uom = $11, value = $12, baseline_value = $13, min_threshold = $14, max_threshold = $15, variance = $16, variance_percent = $17, variance_flag = $18, status = $19, remarks = $20, updated_by_user_id = $21, updated_at = NOW() WHERE id = $1 RETURNING *`, [record.id, companyDbId, record.type, meter ? meter.id : null, sourceId, record.periodStart, record.periodEnd, record.meterName, record.previousReading, record.currentReading, uom, record.value, record.baselineValue, record.minThreshold, record.maxThreshold, record.variance, record.variancePercent, record.varianceFlag, record.status, record.remarks, userDbId]);
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    const updated = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
    res.json(rowToRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}
