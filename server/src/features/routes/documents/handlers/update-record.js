import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";

import { persistDocumentFile, normalizeDocumentFile } from "./file.js";
import { rowToDocument } from "./map.js";
import { selectDocumentsSql } from "./sql.js";

function deriveDocumentStatus(expiresOn) {
  if (!expiresOn) return "valid";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresOn);
  expiry.setHours(0, 0, 0, 0);
  if (Number.isNaN(expiry.getTime())) return "valid";
  if (expiry.getTime() < today.getTime()) return "expired";
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 30 ? "expiring" : "valid";
}

export async function updateDocumentRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const existing = await query(
      `SELECT id, facility_id, title, file_name FROM document_records WHERE id = $1 AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = document_records.facility_id)`,
      [req.params.id, userDbId],
    );
    if (!existing.rowCount) throw createHttpError(404, "Document not found.");

    const companyId = String(req.body?.facilityId || req.body?.companyId || existing.rows[0].facility_id).trim();
    const title = String(req.body?.title || "").trim();
    const category = String(req.body?.category || "").trim();
    const ownerDepartment = String(req.body?.ownerDepartment || "").trim();
    const expiresOn = String(req.body?.expiresOn || "").trim() || null;
    const notes = String(req.body?.notes || "").trim() || null;
    const fileInput = req.body?.file || null;

    if (!companyId) throw createHttpError(400, "Company is required.");
    if (!title) throw createHttpError(400, "Title is required.");
    if (!category) throw createHttpError(400, "Category is required.");
    if (!ownerDepartment) throw createHttpError(400, "Owner department is required.");

    const companyDbId = await getCompanyDbIdOrThrow(companyId);
    await assertUserCompanyAccess(userDbId, companyDbId);
    const status = deriveDocumentStatus(expiresOn);

    const attachment = fileInput ? normalizeDocumentFile(fileInput) : null;
    await query(
      `UPDATE document_records SET facility_id = $2, title = $3, category = $4, owner_department = $5, expires_on = $6, status = $7, file_name = $8, notes = $9, updated_by_user_id = $10, updated_at = NOW() WHERE id = $1`,
      [
        req.params.id,
        companyDbId,
        title,
        category,
        ownerDepartment,
        expiresOn,
        status,
        attachment?.fileName || existing.rows[0].file_name,
        notes,
        userDbId,
      ],
    );

    if (attachment) {
      await persistDocumentFile({
        recordId: Number(req.params.id),
        companyDbId,
        title,
        attachment,
        userDbId,
      });
    }

    const result = await query(`${selectDocumentsSql} WHERE dr.id = $1`, [req.params.id]);
    res.json(rowToDocument(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
