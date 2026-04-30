import { query } from "../../../../core/shared/postgres.js";
import { createHttpError, isValidUtilityType, rowToUomOption } from "../../../modules/utilities/record.js";
import { ensureUtilitiesReady } from "../ready.js";

export async function listUtilityUomOptions(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const type = req.query.type ? String(req.query.type).trim().toLowerCase() : "";
    if (type && !isValidUtilityType(type)) throw createHttpError(400, "Invalid utility type.");

    const result = await query(
      `SELECT DISTINCT u.id, u.name, ut.key AS utility_type_key FROM uom_wiring uw JOIN uom u ON u.id = uw.uom_id JOIN utility_types ut ON ut.id = uw.utility_type_id WHERE u.is_active = 1 AND ut.is_active = 1 AND uw.is_active = 1 ${type ? "AND ut.key = $1" : ""} ORDER BY ut.key ASC, u.name ASC`,
      type ? [type] : [],
    );

    res.json(result.rows.map(rowToUomOption));
  } catch (error) {
    next(error);
  }
}
