import { query } from "../../../shared/postgres.js";
import { rowToRecord } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

export async function listUtilityRecords(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const params = [await getRequestUserDbId(req) || -1];
    const filters = [`EXISTS (SELECT 1 FROM user_companies uf WHERE uf.user_id = $1 AND uf.company_id = ur.facility_id)`];
    if (req.query.type) { params.push(String(req.query.type)); filters.push(`ur.type = $${params.length}`); }
    if (req.query.facilityId) { params.push(await getCompanyDbIdOrThrow(String(req.query.facilityId))); filters.push(`ur.facility_id = $${params.length}`); }
    if (req.query.search) { params.push(`%${String(req.query.search).trim()}%`); filters.push(`ur.meter_name ILIKE $${params.length}`); }
    const result = await query(`${selectUtilitySql} WHERE ${filters.join(" AND ")} ORDER BY ur.period_start DESC, ur.created_at DESC`, params);
    res.json(result.rows.map(rowToRecord));
  } catch (error) {
    next(error);
  }
}
