import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

export async function deleteChemical(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const deleted = await withTransaction(async (client) => {
      const existing = await client.query(
        `SELECT c.id FROM chemicals c WHERE c.id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = c.facility_id)`,
        [req.params.id, userDbId],
      );
      if (!existing.rowCount) return false;
      await client.query("DELETE FROM chemicals WHERE id = $1", [req.params.id]);
      return true;
    });

    if (!deleted) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
