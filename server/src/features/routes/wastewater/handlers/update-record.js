import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { rowToWastewaterRecord } from "./map.js";
import { normalizeWastewaterInput } from "./normalize.js";
import { selectWastewaterSql } from "./sql.js";

export async function updateWastewaterRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeWastewaterInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const updated = await withTransaction(async (client) => {
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
        `UPDATE wastewater_lab_records
         SET facility_id = $2,
             sample_date = $3,
             sample_point = $4,
             ph = $5,
             cod = $6,
             bod = $7,
             tss = $8,
             do_value = $9,
             lab_report_name = $10,
             notes = $11,
             updated_by_user_id = $12,
             updated_at = NOW()
         WHERE id = $1`,
        [
          req.params.id,
          companyDbId,
          input.sampleDate,
          input.point,
          input.pH,
          input.COD,
          input.BOD,
          input.TSS,
          input.DO,
          input.labReportFileName,
          input.notes,
          userDbId,
        ],
      );

      await client.query(
        `UPDATE file_assets
         SET company_id = $2, updated_at = NOW()
         WHERE module = 'wastewater'
           AND entity_type = 'wastewater_lab_record'
           AND entity_id = $1`,
        [req.params.id, companyDbId],
      );

      return client.query(`${selectWastewaterSql} WHERE wlr.id = $1`, [req.params.id]);
    });

    res.json(rowToWastewaterRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
}
