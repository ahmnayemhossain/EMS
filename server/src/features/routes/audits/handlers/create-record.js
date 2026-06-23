import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { query } from "../../../../core/shared/postgres.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../../utilities/request-context.js";

import { rowToAuditRecord } from "./map.js";
import { selectAuditSql } from "./sql.js";

export async function createAuditRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) throw createHttpError(401, "Unauthorized");

    const companyId = String(req.body?.facilityId || req.body?.companyId || "").trim();
    const name = String(req.body?.name || "").trim();
    const customerName = String(req.body?.customerName || "").trim() || null;
    const date = String(req.body?.date || "").trim();
    const nextAuditDate = String(req.body?.nextAuditDate || "").trim() || null;
    const auditor = String(req.body?.auditor || "").trim();
    const templateId = String(req.body?.templateId || "").trim();
    const progress = Number(req.body?.progress || 0);
    const overallScore = Number(req.body?.overallScore || 0);
    const findingsCount = req.body?.findingsCount && typeof req.body.findingsCount === "object"
      ? req.body.findingsCount
      : { minor: 0, major: 0, critical: 0 };
    const checklist = Array.isArray(req.body?.checklist) ? req.body.checklist : [];
    const findings = Array.isArray(req.body?.findings) ? req.body.findings : [];

    if (!companyId) throw createHttpError(400, "Company is required.");
    if (!name) throw createHttpError(400, "Audit name is required.");
    if (!date) throw createHttpError(400, "Audit date is required.");
    if (!auditor) throw createHttpError(400, "Auditor is required.");
    if (!templateId) throw createHttpError(400, "Template is required.");

    const companyDbId = await getCompanyDbIdOrThrow(companyId);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const inserted = await query(
      `INSERT INTO audit_records (facility_id, name, customer_name, audit_date, next_audit_date, auditor, template_id, progress, overall_score, findings_count, checklist, findings, created_by_user_id, updated_by_user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,$13) RETURNING id`,
      [
        companyDbId,
        name,
        customerName,
        date,
        nextAuditDate,
        auditor,
        templateId,
        Number.isFinite(progress) ? progress : 0,
        Number.isFinite(overallScore) ? overallScore : 0,
        JSON.stringify(findingsCount),
        JSON.stringify(checklist),
        JSON.stringify(findings),
        userDbId,
      ],
    );

    const result = await query(`${selectAuditSql} WHERE ar.id = $1`, [inserted.rows[0]?.id]);
    res.status(201).json(rowToAuditRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
}
