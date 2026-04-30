import { query } from "../../../../core/shared/postgres.js";
import { removeUtilityFiles } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";

export async function deleteUtilityRecord(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const userDbId = await getRequestUserDbId(req);
    const existing = await query(`SELECT ur.id FROM utility_records ur WHERE ur.id = $1 AND EXISTS (SELECT 1 FROM user_companies uf WHERE uf.user_id = $2 AND uf.company_id = ur.facility_id)`, [req.params.id, userDbId || -1]);
    if (!existing.rowCount) return res.status(404).json({ error: "not_found" });
    await removeUtilityFiles(Number(req.params.id));
    await query(`DELETE FROM utility_records ur WHERE ur.id = $1 AND EXISTS (SELECT 1 FROM user_companies uf WHERE uf.user_id = $2 AND uf.company_id = ur.facility_id)`, [req.params.id, userDbId || -1]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
