import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { getCapaById, loadOrderedIds, reorderStatusColumn, rowToCapa } from "./shared.js";

export async function dismissCapaRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const facilityId = String(req.body?.facilityId ?? "").trim();
    const dismissed = Boolean(req.body?.dismissed);
    if (!facilityId) throw createHttpError(400, "facilityId is required.");

    const companyDbId = await getCompanyDbIdOrThrow(facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const updated = await withTransaction(async (client) => {
      const existing = await getCapaById(client, req.params.id);
      if (!existing) return null;
      if (String(existing.facility_id) !== String(companyDbId)) throw createHttpError(400, "facilityId cannot be changed.");
      if (dismissed && existing.status !== "closed") throw createHttpError(400, "Only closed CAPA can be dismissed.");

      await client.query(
        `UPDATE capa_records
         SET is_dismissed = $2,
             dismissed_at = CASE WHEN $2 = 1 THEN NOW() ELSE NULL END,
             updated_by_user_id = $3,
             updated_at = NOW()
         WHERE id = $1`,
        [req.params.id, dismissed ? 1 : 0, userDbId],
      );

      if (!dismissed) {
        const targetIds = await loadOrderedIds(client, companyDbId, existing.status, Number(req.params.id));
        targetIds.push(Number(req.params.id));
        await reorderStatusColumn(client, companyDbId, existing.status, targetIds, userDbId);
      }

      return getCapaById(client, req.params.id);
    });

    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json(rowToCapa(updated));
  } catch (error) {
    next(error);
  }
}
