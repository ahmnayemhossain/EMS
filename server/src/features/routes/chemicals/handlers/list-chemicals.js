import { query } from "../../../../core/shared/postgres.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToChemical } from "./map.js";
import { selectChemicalsSql } from "./sql.js";

export async function listChemicals(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    const params = [userDbId];
    let where = "WHERE EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $1 AND uc.company_id = c.facility_id)";
    if (companyId) {
      params.push(companyId);
      where += ` AND c.facility_id::text = $${params.length}`;
    }

    const result = await query(`${selectChemicalsSql} ${where} ORDER BY c.created_at DESC`, params);
    res.json(result.rows.map(rowToChemical));
  } catch (error) {
    next(error);
  }
}

