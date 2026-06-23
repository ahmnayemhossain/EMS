import { query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToWasteRecord } from "./map.js";
import { selectWasteSql } from "./sql.js";

export async function listWasteRecords(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    const params = [userDbId];
    let where = "WHERE EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $1 AND uc.company_id = wr.facility_id)";
    if (companyId) {
      params.push(companyId);
      where += ` AND wr.facility_id::text = $${params.length}`;
    }

    const result = await query(`${selectWasteSql} ${where} ORDER BY wr.log_date DESC, wr.created_at DESC`, params);
    res.json(result.rows.map(rowToWasteRecord));
  } catch (error) {
    next(error);
  }
}
