import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";

import { normalizeChemicalInput } from "./normalize.js";
import { rowToChemical } from "./map.js";
import { selectChemicalsSql } from "./sql.js";
import { assertUniqueChemicalName, rethrowChemicalNameConflict } from "./assert-unique-name.js";

export async function createChemical(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeChemicalInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    if (typeof input.stockKg === "number" && input.stockKg < 0) throw createHttpError(400, "stockKg must be >= 0.");

    try {
      const created = await withTransaction(async (client) => {
        await assertUniqueChemicalName(client, input.name);
        const inserted = await client.query(
          `INSERT INTO chemicals (facility_id, name, trade_name, supplier, storage_area, hazard_classes, approval_status, stock_kg, min_stock_kg, expiry_date, sds_id, ppe, storage_instructions, compatibility_warnings, linked_waste_stream, batches, created_by_user_id, updated_by_user_id) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15,$16::jsonb,$17,$17) RETURNING id`,
          [
            companyDbId,
            input.name,
            input.tradeName,
            input.supplier,
            input.storageArea,
            JSON.stringify(input.hazardClasses),
            input.approvalStatus,
            input.stockKg,
            input.minStockKg,
            input.expiryDate,
            input.sdsId,
            JSON.stringify(input.ppe),
            JSON.stringify(input.storageInstructions),
            JSON.stringify(input.compatibilityWarnings),
            input.linkedWasteStream,
            JSON.stringify(input.batches),
            userDbId,
          ],
        );

        return client.query(`${selectChemicalsSql} WHERE c.id = $1`, [inserted.rows[0].id]);
      });

      res.status(201).json(rowToChemical(created.rows[0]));
    } catch (error) {
      rethrowChemicalNameConflict(error);
    }
  } catch (error) {
    next(error);
  }
}
