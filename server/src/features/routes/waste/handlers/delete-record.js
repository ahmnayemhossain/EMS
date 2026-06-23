import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query, withTransaction } from "../../../../core/shared/postgres.js";
import { removeFileIfExists, resolveCdnPath } from "../../../../core/shared/storage.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

export async function deleteWasteRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const files = await query(
      `SELECT fa.storage_path
       FROM file_assets fa
       JOIN waste_records wr ON wr.id = fa.entity_id
       WHERE fa.module = 'waste'
         AND fa.entity_type = 'waste_record'
         AND fa.entity_id = $1
         AND EXISTS (
           SELECT 1
           FROM user_companies uc
           WHERE uc.user_id = $2
             AND uc.company_id = wr.facility_id
         )`,
      [req.params.id, userDbId],
    );

    await withTransaction(async (client) => {
      const existing = await client.query(
        `SELECT id
         FROM waste_records wr
         WHERE wr.id = $1
           AND EXISTS (
             SELECT 1
             FROM user_companies uc
             WHERE uc.user_id = $2
               AND uc.company_id = wr.facility_id
           )`,
        [req.params.id, userDbId],
      );
      if (!existing.rowCount) throw createHttpError(404, "Waste record not found.");

      await client.query(
        `DELETE FROM file_assets
         WHERE module = 'waste'
           AND entity_type = 'waste_record'
           AND entity_id = $1`,
        [req.params.id],
      );
      await client.query(`DELETE FROM waste_records WHERE id = $1`, [req.params.id]);
    });

    for (const file of files.rows) {
      if (file.storage_path) await removeFileIfExists(resolveCdnPath(file.storage_path));
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
