import { query } from "../postgres.js";
import { legacyTables } from "./legacy-tables.js";

export async function archiveLegacyTextPrimaryKeyTables() {
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  for (const table of legacyTables) {
    if (!(await tableExists(table))) continue;
    const type = await columnDataType(table, "id");
    const numeric = type === "bigint" || type === "integer";
    const utilityRelationIsNumeric = table !== "utility_records" || (await columnDataType(table, "facility_id")) === "bigint";
    if (numeric && utilityRelationIsNumeric) continue;
    await query(`ALTER TABLE ${table} RENAME TO ${table}_legacy_${suffix}`);
  }
}

async function tableExists(tableName) {
  const result = await query("SELECT to_regclass($1) AS name", [`public.${tableName}`]);
  return Boolean(result.rows[0]?.name);
}

async function columnDataType(tableName, columnName) {
  const result = await query(
    `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `,
    [tableName, columnName],
  );
  return result.rows[0]?.data_type || null;
}
