import { query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToWasteRecord } from "./map.js";
import { selectWasteSql } from "./sql.js";

export async function getWasteRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const result = await query(
      `${selectWasteSql}
       WHERE wr.id = $1
         AND EXISTS (
           SELECT 1
           FROM user_companies uc
           WHERE uc.user_id = $2
             AND uc.company_id = wr.facility_id
         )`,
      [req.params.id, userDbId],
    );

    if (!result.rowCount) throw createHttpError(404, "Waste record not found.");
    res.json(rowToWasteRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
