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

export async function createDocumentRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const companyId = String(req.body?.facilityId || req.body?.companyId || "").trim();
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
    if (!fileInput) throw createHttpError(400, "Document file is required.");

    const attachment = normalizeDocumentFile(fileInput);
    const companyDbId = await getCompanyDbIdOrThrow(companyId);
    await assertUserCompanyAccess(userDbId, companyDbId);
    const status = deriveDocumentStatus(expiresOn);

    const inserted = await query(
      `INSERT INTO document_records (facility_id, title, category, owner_department, expires_on, status, file_name, notes, created_by_user_id, updated_by_user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9) RETURNING id`,
      [companyDbId, title, category, ownerDepartment, expiresOn, status, attachment.fileName, notes, userDbId],
    );

    const recordId = inserted.rows[0]?.id;
    await persistDocumentFile({
      recordId,
      companyDbId,
      title,
      attachment,
      userDbId,
    });

    const result = await query(`${selectDocumentsSql} WHERE dr.id = $1`, [recordId]);
    res.status(201).json(rowToDocument(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
