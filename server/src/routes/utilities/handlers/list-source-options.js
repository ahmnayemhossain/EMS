import { query } from "../../../shared/postgres.js";
import { createHttpError, isValidUtilityType } from "../../../modules/utilities/record.js";
import { ensureUtilitiesReady } from "../ready.js";

export async function listUtilitySourceOptions(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const type = req.query.type ? String(req.query.type).trim().toLowerCase() : "";
    if (type && !isValidUtilityType(type)) throw createHttpError(400, "Invalid utility type.");

    const result = await query(
      `SELECT DISTINCT s.id, s.name, ut.key AS utility_type_key FROM source_wiring sw JOIN sources s ON s.id = sw.source_id JOIN utility_types ut ON ut.id = sw.utility_type_id WHERE s.is_active = 1 AND ut.is_active = 1 AND sw.is_active = 1 ${type ? "AND ut.key = $1" : ""} ORDER BY ut.key ASC, s.name ASC`,
      type ? [type] : [],
    );

    res.json(result.rows.map((row) => ({ id: String(row.id), name: row.name, utilityType: row.utility_type_key })));
  } catch (error) {
    next(error);
  }
}
