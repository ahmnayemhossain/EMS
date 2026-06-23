import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { removeFileIfExists, resolveCdnPath } from "../../../../core/shared/storage.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

export async function deleteDocumentRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const existing = await query(
      `SELECT id FROM document_records WHERE id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = document_records.facility_id)`,
      [req.params.id, userDbId],
    );
    if (!existing.rowCount) throw createHttpError(404, "Document not found.");

    const files = await query(
      `SELECT storage_path FROM file_assets WHERE module = 'documents' AND entity_type = 'document_record' AND entity_id = $1`,
      [req.params.id],
    );

    await query(`DELETE FROM file_assets WHERE module = 'documents' AND entity_type = 'document_record' AND entity_id = $1`, [req.params.id]);
    await query(`DELETE FROM document_records WHERE id = $1`, [req.params.id]);

    for (const file of files.rows) {
      if (file.storage_path) {
        await removeFileIfExists(resolveCdnPath(file.storage_path));
      }
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
