import { query } from "../../../shared/postgres.js";
import { rowToRecord } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";

export async function getUtilityRecord(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const result = await query(`${selectUtilitySql} WHERE ur.id = $1 AND EXISTS (SELECT 1 FROM user_companies uf WHERE uf.user_id = $2 AND uf.company_id = ur.facility_id)`, [req.params.id, await getRequestUserDbId(req) || -1]);
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    res.json(rowToRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
