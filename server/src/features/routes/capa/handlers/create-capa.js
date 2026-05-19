import { pool } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";

import { getCapaById, getNextPositionIndex, normalizeCapaInput, rowToCapa } from "./shared.js";

export async function createCapaRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const input = normalizeCapaInput(req.body || {});
    const companyDbId = await getCompanyDbIdOrThrow(input.facilityId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const positionIndex = await getNextPositionIndex(client, companyDbId, input.status);
      const inserted = await client.query(
        `INSERT INTO capa_records (facility_id, title, description, owner_name, severity, status, due_date, evidence_count, related_finding_id, position_index, created_by_user_id, updated_by_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)
         RETURNING id`,
        [
          companyDbId,
          input.title,
          input.description,
          input.owner,
          input.severity,
          input.status,
          input.dueDate,
          input.evidenceCount,
          input.relatedFindingId,
          positionIndex,
          userDbId,
        ],
      );
      const created = await getCapaById(client, inserted.rows[0].id);
      await client.query("COMMIT");
      res.status(201).json(rowToCapa(created));
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
