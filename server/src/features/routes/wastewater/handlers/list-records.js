import { query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToWastewaterRecord } from "./map.js";
import { selectWastewaterSql } from "./sql.js";

export async function listWastewaterRecords(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    const params = [userDbId];
    let where = "WHERE EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $1 AND uc.company_id = wlr.facility_id)";
    if (companyId) {
      params.push(companyId);
      where += ` AND wlr.facility_id::text = $${params.length}`;
    }

    const result = await query(`${selectWastewaterSql} ${where} ORDER BY wlr.sample_date DESC, wlr.created_at DESC`, params);
    res.json(result.rows.map(rowToWastewaterRecord));
  } catch (error) {
    next(error);
  }
}
