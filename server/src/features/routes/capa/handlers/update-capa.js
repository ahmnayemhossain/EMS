import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";

import { getCapaById, getNextPositionIndex, loadOrderedIds, normalizeCapaInput, reorderStatusColumn, rowToCapa } from "./shared.js";

export async function updateCapaRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeCapaInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const updated = await withTransaction(async (client) => {
      const existing = await getCapaById(client, req.params.id);
      if (!existing) return null;
      if (String(existing.facility_id) !== String(companyDbId)) throw createHttpError(400, "facilityId cannot be changed.");

      let nextPosition = Number(existing.position_index ?? 0);
      if (existing.status !== input.status) {
        nextPosition = await getNextPositionIndex(client, companyDbId, input.status);
      }

      await client.query(
        `UPDATE capa_records
         SET title = $2,
             description = $3,
             owner_name = $4,
             severity = $5,
             status = $6,
             due_date = $7,
             evidence_count = $8,
             related_finding_id = $9,
             position_index = $10,
             updated_by_user_id = $11,
             updated_at = NOW()
         WHERE id = $1`,
        [
          req.params.id,
          input.title,
          input.description,
          input.owner,
          input.severity,
          input.status,
          input.dueDate,
          input.evidenceCount,
          input.relatedFindingId,
          nextPosition,
          userDbId,
        ],
      );

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
