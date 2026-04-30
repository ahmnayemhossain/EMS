import { query } from "../../../../core/shared/postgres.js";
import { MAX_PDF_BYTES } from "../../../../core/shared/storage.js";
import { normalizeAttachmentInput, rowToRecord } from "../../../modules/utilities/record.js";
import { replaceUtilityAttachment, selectUtilitySql } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";

export async function uploadUtilityAttachment(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const userDbId = await getRequestUserDbId(req);
    const attachment = normalizeAttachmentInput(req.body || {}, MAX_PDF_BYTES);
    const existing = await query(`${selectUtilitySql} WHERE ur.id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = ur.facility_id)`, [req.params.id, userDbId || -1]);
    if (!existing.rowCount) return res.status(404).json({ error: "not_found" });
    const updated = await replaceUtilityAttachment(rowToRecord(existing.rows[0]), attachment, userDbId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
