import { query } from "../../../shared/postgres.js";

export async function isAllowedUom(type, uom) {
  const result = await query(
    `
      SELECT 1
      FROM uom_wiring uw
      JOIN uom u ON u.id = uw.uom_id
      JOIN utility_types ut ON ut.id = uw.utility_type_id
      WHERE lower(u.name) = lower($1)
        AND ut.key = $2
        AND u.is_active = 1
        AND ut.is_active = 1
        AND uw.is_active = 1
      LIMIT 1
    `,
    [uom, type],
  );

  return result.rowCount > 0;
}

export async function isAllowedSource(type, sourceId) {
  const sql = sourceId
    ? `SELECT 1 FROM source_wiring sw JOIN sources s ON s.id = sw.source_id JOIN utility_types ut ON ut.id = sw.utility_type_id WHERE sw.source_id = $1 AND ut.key = $2 AND s.is_active = 1 AND ut.is_active = 1 AND sw.is_active = 1 LIMIT 1`
    : `SELECT 1 FROM source_wiring sw JOIN utility_types ut ON ut.id = sw.utility_type_id WHERE ut.key = $1 AND sw.is_active = 1 LIMIT 1`;
  const params = sourceId ? [sourceId, type] : [type];
  const result = await query(sql, params);
  return sourceId ? result.rowCount > 0 : result.rowCount === 0;
}
