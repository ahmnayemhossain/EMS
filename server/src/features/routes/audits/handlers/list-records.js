import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { rowToAuditRecord } from "./map.js";
import { selectAuditSql } from "./sql.js";

export async function listAuditRecords(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    const params = [userDbId];
    let where = "WHERE EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $1 AND uc.company_id = ar.facility_id)";
    if (companyId) {
      params.push(companyId);
      where += ` AND ar.facility_id::text = $${params.length}`;
    }

    const result = await query(`${selectAuditSql} ${where} ORDER BY ar.audit_date DESC, ar.id DESC`, params);
    res.json(result.rows.map(rowToAuditRecord));
  } catch (error) {
    next(error);
  }
}
