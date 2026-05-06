import { query } from "../../../../core/shared/postgres.js";
import { createHttpError } from "../record.js";

export async function resolveUtilityMeter({
  meterId,
  companyDbId,
  type,
}) {
  if (!meterId) return null;

  const result = await query(
    `
      SELECT
        m.id,
        m.name,
        m.company_id,
        ut.key AS utility_type_key,
        m.source_id,
        u.name AS uom_name
      FROM meters m
      JOIN utility_types ut ON ut.id = m.utility_type_id
      JOIN uom u ON u.id = m.uom_id
      WHERE m.id = $1
        AND m.company_id = $2
        AND ut.key = $3
        AND m.is_active = 1
        AND ut.is_active = 1
      LIMIT 1
    `,
    [meterId, companyDbId, type],
  );

  if (!result.rowCount) throw createHttpError(400, "Invalid meter selection.");

  const row = result.rows[0];
  return {
    id: Number(row.id),
    name: row.name,
    sourceId: row.source_id ? Number(row.source_id) : null,
    uom: row.uom_name,
  };
}

