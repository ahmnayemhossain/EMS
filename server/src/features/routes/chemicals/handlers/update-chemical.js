import { pool } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";

import { normalizeChemicalInput } from "./normalize.js";
import { rowToChemical } from "./map.js";
import { selectChemicalsSql } from "./sql.js";

export async function updateChemical(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeChemicalInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    if (typeof input.stockKg === "number" && input.stockKg < 0) throw createHttpError(400, "stockKg must be >= 0.");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query("SELECT id, facility_id FROM chemicals WHERE id = $1", [req.params.id]);
      if (!existing.rowCount) return res.status(404).json({ error: "not_found" });
      if (String(existing.rows[0].facility_id) !== String(companyDbId)) {
        // Disallow moving between companies via update (keeps access rules simple).
        throw createHttpError(400, "facilityId cannot be changed.");
      }

      await client.query(
        `UPDATE chemicals SET name=$2, trade_name=$3, supplier=$4, storage_area=$5, hazard_classes=$6::jsonb, approval_status=$7, stock_kg=$8, min_stock_kg=$9, expiry_date=$10, sds_id=$11, ppe=$12::jsonb, storage_instructions=$13::jsonb, compatibility_warnings=$14::jsonb, linked_waste_stream=$15, batches=$16::jsonb, updated_by_user_id=$17, updated_at=NOW() WHERE id=$1`,
        [
          req.params.id,
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

      const updated = await client.query(`${selectChemicalsSql} WHERE c.id = $1`, [req.params.id]);
      await client.query("COMMIT");
      res.json(rowToChemical(updated.rows[0]));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

