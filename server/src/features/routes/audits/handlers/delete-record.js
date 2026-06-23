import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";
import { createHttpError } from "../../../modules/utilities/record.js";

export async function deleteAuditRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const existing = await query(
      `SELECT id FROM audit_records WHERE id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = audit_records.facility_id)`,
      [req.params.id, userDbId],
    );
    if (!existing.rowCount) throw createHttpError(404, "Audit not found.");

    await query(`DELETE FROM audit_records WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
