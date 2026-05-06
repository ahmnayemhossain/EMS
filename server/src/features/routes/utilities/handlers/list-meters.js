import { query } from "../../../../core/shared/postgres.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError, isValidUtilityType } from "../../../modules/utilities/record.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

export async function listUtilityMeters(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const type = req.query.type ? String(req.query.type).trim().toLowerCase() : "";
    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    if (!type || !isValidUtilityType(type)) throw createHttpError(400, "Invalid utility type.");
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
          ut.key AS utility_type_key,
          s.id AS source_id,
          s.name AS source_name,
          u.name AS uom_name
        FROM meters m
        JOIN utility_types ut ON ut.id = m.utility_type_id
        JOIN uom u ON u.id = m.uom_id
        LEFT JOIN sources s ON s.id = m.source_id
        WHERE m.company_id = $1
          AND ut.key = $2
          AND m.is_active = 1
          AND ut.is_active = 1
        ORDER BY m.name ASC
      `,
      [companyDbId, type],
    );

    res.json(
      result.rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        code: row.code || undefined,
        location: row.location || undefined,
        utilityType: row.utility_type_key,
        sourceId: row.source_id ? String(row.source_id) : undefined,
        sourceName: row.source_name || undefined,
        uom: row.uom_name,
      })),
    );
  } catch (error) {
    next(error);
  }
}

