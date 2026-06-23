import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToDocument } from "./map.js";
import { selectDocumentsSql } from "./sql.js";

export async function getDocumentRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const result = await query(
      `${selectDocumentsSql} WHERE dr.id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = dr.facility_id)`,
      [req.params.id, userDbId],
    );
    if (!result.rowCount) throw createHttpError(404, "Document not found.");
    res.json(rowToDocument(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
