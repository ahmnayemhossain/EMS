import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { getCapaById, loadOrderedIds, normalizeCapaMoveInput, reorderStatusColumn, rowToCapa } from "./shared.js";

export async function moveCapaRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeCapaMoveInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const updated = await withTransaction(async (client) => {
      const existing = await getCapaById(client, req.params.id);
      if (!existing) return null;
      if (String(existing.facility_id) !== String(companyDbId)) throw createHttpError(400, "facilityId cannot be changed.");

      const targetIds = await loadOrderedIds(client, companyDbId, input.status, Number(req.params.id));
      const insertAt = Math.min(input.targetIndex, targetIds.length);
      const orderedTargetIds = [...targetIds.slice(0, insertAt), Number(req.params.id), ...targetIds.slice(insertAt)];

      await client.query(
        `UPDATE capa_records
         SET status = $2, position_index = $3, updated_by_user_id = $4, updated_at = NOW()
         WHERE id = $1`,
        [req.params.id, input.status, insertAt, userDbId],
      );

      await reorderStatusColumn(client, companyDbId, input.status, orderedTargetIds, userDbId);
      if (existing.status !== input.status) {
        const sourceIds = await loadOrderedIds(client, companyDbId, existing.status, Number(req.params.id));
        await reorderStatusColumn(client, companyDbId, existing.status, sourceIds, userDbId);
      }

      return getCapaById(client, req.params.id);
    });

    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json(rowToCapa(updated));
  } catch (error) {
    next(error);
  }
}
