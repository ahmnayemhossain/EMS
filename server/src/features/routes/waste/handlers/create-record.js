import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";

import { rowToWasteRecord } from "./map.js";
import { normalizeWasteInput } from "./normalize.js";
import { selectWasteSql } from "./sql.js";

export async function createWasteRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeWasteInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const created = await withTransaction(async (client) => {
      const inserted = await client.query(
        `
          INSERT INTO waste_records (
            facility_id,
            log_date,
            stream,
            waste_type,
            qty_kg,
            storage_location,
            vendor,
            disposal_status,
            manifest_no,
            due_by,
            notes,
            created_by_user_id,
            updated_by_user_id
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)
          RETURNING id
        `,
        [
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

      return client.query(`${selectWasteSql} WHERE wr.id = $1`, [inserted.rows[0].id]);
    });

    res.status(201).json(rowToWasteRecord(created.rows[0]));
  } catch (error) {
    next(error);
  }
}
