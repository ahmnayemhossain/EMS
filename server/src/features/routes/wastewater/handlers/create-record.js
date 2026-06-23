import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";

import { rowToWastewaterRecord } from "./map.js";
import { normalizeWastewaterInput } from "./normalize.js";
import { selectWastewaterSql } from "./sql.js";

export async function createWastewaterRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeWastewaterInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const created = await withTransaction(async (client) => {
      const inserted = await client.query(
        `
          INSERT INTO wastewater_lab_records (
            facility_id,
            sample_date,
            sample_point,
            ph,
            cod,
            bod,
            tss,
            do_value,
            lab_report_name,
            notes,
            created_by_user_id,
            updated_by_user_id
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)
          RETURNING id
        `,
        [
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

      return client.query(`${selectWastewaterSql} WHERE wlr.id = $1`, [inserted.rows[0].id]);
    });

    res.status(201).json(rowToWastewaterRecord(created.rows[0]));
  } catch (error) {
    next(error);
  }
}
