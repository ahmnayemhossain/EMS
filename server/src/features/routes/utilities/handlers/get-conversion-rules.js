import { query } from "../../../../core/shared/postgres.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getCompanyDbIdOrThrow, getRequestUserDbId } from "../request-context.js";

async function getRuleValue({ companyDbId, key }) {
  const companyRes = await query(
    `SELECT value FROM utility_conversion_rules WHERE key = $1 AND company_id = $2 AND is_active = 1 LIMIT 1`,
    [key, companyDbId],
  );
  if (companyRes.rows[0]) return Number(companyRes.rows[0].value);
  const globalRes = await query(
    `SELECT value FROM utility_conversion_rules WHERE key = $1 AND company_id IS NULL AND is_active = 1 LIMIT 1`,
    [key],
  );
  return globalRes.rows[0] ? Number(globalRes.rows[0].value) : null;
}

export async function getUtilityConversionRules(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const companyId = req.query.companyId ? String(req.query.companyId).trim() : "";
    if (!companyId) throw createHttpError(400, "companyId is required.");

    const companyDbId = await getCompanyDbIdOrThrow(companyId);
    const userDbId = await getRequestUserDbId(req);
    await assertUserCompanyAccess(userDbId, companyDbId);

    const generatorDieselKwhPerLiter = await getRuleValue({
      companyDbId,
      key: "generator_diesel_kwh_per_liter",
    });

    res.json({
      generatorDieselKwhPerLiter,
    });
  } catch (error) {
    next(error);
  }
}

