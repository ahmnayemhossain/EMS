import { query } from "../../../../core/shared/postgres.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToChemical } from "./map.js";
import { selectChemicalsSql } from "./sql.js";

export async function getChemical(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const result = await query(
      `${selectChemicalsSql} WHERE c.id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = c.facility_id)`,
      [req.params.id, userDbId],
    );
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    res.json(rowToChemical(result.rows[0]));
  } catch (error) {
    next(error);
  }
}

