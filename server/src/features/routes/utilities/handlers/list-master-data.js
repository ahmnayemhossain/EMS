import { query } from "../../../../core/shared/postgres.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

export async function listUtilityMasterData(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    if (!companyId) throw createHttpError(400, "companyId is required.");

    const companyDbId = await getCompanyDbIdOrThrow(companyId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const result = await query(
      `
        SELECT
          m.id,
          m.name,
          m.code,
          m.location,
          m.is_active,
          m.created_at,
          m.updated_at,
          ut.key AS utility_type_key,
          ut.name AS utility_type_name,
          s.id AS source_id,
          s.name AS source_name,
          u.name AS uom_name,
          COALESCE(ce.name, cu.username) AS created_by_user_name,
          COALESCE(ue.name, uu.username) AS updated_by_user_name
        FROM meters m
        JOIN utility_types ut ON ut.id = m.utility_type_id
        JOIN uom u ON u.id = m.uom_id
        LEFT JOIN sources s ON s.id = m.source_id
        LEFT JOIN users cu ON cu.id = m.created_by_user_id
        LEFT JOIN employees ce ON ce.id = cu.employee_id
        LEFT JOIN users uu ON uu.id = m.updated_by_user_id
        LEFT JOIN employees ue ON ue.id = uu.employee_id
        WHERE m.company_id = $1
        ORDER BY ut.key ASC, m.name ASC
      `,
      [companyDbId],
    );

    res.json(
      result.rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        code: row.code || undefined,
        location: row.location || undefined,
        utilityType: row.utility_type_key,
        utilityTypeName: row.utility_type_name,
        sourceId: row.source_id ? String(row.source_id) : undefined,
        sourceName: row.source_name || undefined,
        uom: row.uom_name,
        isActive: Number(row.is_active) === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        preparedBy: row.created_by_user_name || undefined,
        updatedBy: row.updated_by_user_name || undefined,
      })),
    );
  } catch (error) {
    next(error);
  }
}
