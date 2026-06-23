import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query, withTransaction } from "../../../../core/shared/postgres.js";
import { removeFileIfExists, resolveCdnPath } from "../../../../core/shared/storage.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

export async function deleteWastewaterRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const files = await query(
      `SELECT fa.storage_path
       FROM file_assets fa
       JOIN wastewater_lab_records wlr ON wlr.id = fa.entity_id
       WHERE fa.module = 'wastewater'
         AND fa.entity_type = 'wastewater_lab_record'
         AND fa.entity_id = $1
         AND EXISTS (
           SELECT 1
           FROM user_companies uc
           WHERE uc.user_id = $2
             AND uc.company_id = wlr.facility_id
         )`,
      [req.params.id, userDbId],
    );

    await withTransaction(async (client) => {
      const existing = await client.query(
        `SELECT id
         FROM wastewater_lab_records wlr
         WHERE wlr.id = $1
           AND EXISTS (
             SELECT 1
             FROM user_companies uc
             WHERE uc.user_id = $2
               AND uc.company_id = wlr.facility_id
           )`,
        [req.params.id, userDbId],
      );
      if (!existing.rowCount) throw createHttpError(404, "Wastewater record not found.");

      await client.query(
        `DELETE FROM file_assets
         WHERE module = 'wastewater'
           AND entity_type = 'wastewater_lab_record'
           AND entity_id = $1`,
        [req.params.id],
      );
      await client.query(`DELETE FROM wastewater_lab_records WHERE id = $1`, [req.params.id]);
    });

    for (const file of files.rows) {
      if (file.storage_path) await removeFileIfExists(resolveCdnPath(file.storage_path));
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
