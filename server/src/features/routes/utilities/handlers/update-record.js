import { query } from "../../../../core/shared/postgres.js";
import { assertNoDateRangeOverlap, assertUserCompanyAccess, isAllowedSource, isAllowedUom } from "../../../modules/utilities/access.js";
import { createHttpError, normalizeRecordInput, rowToRecord } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

export async function updateUtilityRecord(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const record = normalizeRecordInput({ ...req.body, id: req.params.id });
    if (!(await isAllowedUom(record.type, record.uom))) throw createHttpError(400, "Invalid utility UOM.");
    if (!(await isAllowedSource(record.type, record.sourceId))) throw createHttpError(400, "Invalid utility source.");
    const companyDbId = await getCompanyDbIdOrThrow(record.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);
    await assertNoDateRangeOverlap(record, companyDbId, record.id);

    const result = await query(`UPDATE utility_records SET facility_id = $2, type = $3, source_id = $4, period_start = $5, period_end = $6, meter_name = $7, previous_reading = $8, current_reading = $9, uom = $10, value = $11, baseline_value = $12, min_threshold = $13, max_threshold = $14, variance = $15, variance_percent = $16, variance_flag = $17, status = $18, remarks = $19, updated_by_user_id = $20, updated_at = NOW() WHERE id = $1 RETURNING *`, [record.id, companyDbId, record.type, record.sourceId, record.periodStart, record.periodEnd, record.meterName, record.previousReading, record.currentReading, record.uom, record.value, record.baselineValue, record.minThreshold, record.maxThreshold, record.variance, record.variancePercent, record.varianceFlag, record.status, record.remarks, userDbId]);
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    const updated = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
    res.json(rowToRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}
