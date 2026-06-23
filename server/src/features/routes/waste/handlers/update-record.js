import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { rowToWasteRecord } from "./map.js";
import { normalizeWasteInput } from "./normalize.js";
import { selectWasteSql } from "./sql.js";

export async function updateWasteRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeWasteInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const existing = await withTransaction(async (client) => {
      const found = await client.query(
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
      if (!found.rowCount) throw createHttpError(404, "Waste record not found.");

      await client.query(
        `UPDATE waste_records
         SET facility_id = $2,
             log_date = $3,
             stream = $4,
             waste_type = $5,
             qty_kg = $6,
             storage_location = $7,
             vendor = $8,
             disposal_status = $9,
             manifest_no = $10,
             due_by = $11,
             notes = $12,
             updated_by_user_id = $13,
             updated_at = NOW()
         WHERE id = $1`,
        [
          req.params.id,
          companyDbId,
          input.date,
          input.stream,
          input.type,
          input.qtyKg,
          input.storageLocation,
          input.vendor,
          input.disposalStatus,
          input.manifestNo,
          input.dueBy,
          input.notes,
          userDbId,
        ],
      );

      await client.query(
        `UPDATE file_assets
         SET company_id = $2, updated_at = NOW()
         WHERE module = 'waste'
           AND entity_type = 'waste_record'
           AND entity_id = $1`,
        [req.params.id, companyDbId],
      );

      return client.query(`${selectWasteSql} WHERE wr.id = $1`, [req.params.id]);
    });

    res.json(rowToWasteRecord(existing.rows[0]));
  } catch (error) {
    next(error);
  }
}
