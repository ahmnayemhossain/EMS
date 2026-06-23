import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { rowToAuditRecord } from "./map.js";
import { selectAuditSql } from "./sql.js";

export async function getAuditRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const result = await query(
      `${selectAuditSql} WHERE ar.id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = ar.facility_id)`,
      [req.params.id, userDbId],
    );
    if (!result.rowCount) throw createHttpError(404, "Audit not found.");
    res.json(rowToAuditRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
