import { query } from "../../../shared/postgres.js";
import { createHttpError } from "../record.js";

export async function assertUserCompanyAccess(userId, companyId) {
  if (!userId) throw createHttpError(403, "Company access is required.");

  const result = await query(
    `
      SELECT 1
      FROM user_companies
      WHERE user_id = $1
        AND company_id = $2
      LIMIT 1
    `,
    [userId, companyId],
  );

  if (!result.rowCount) throw createHttpError(403, "You do not have access to this company.");
}
