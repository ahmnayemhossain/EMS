import { query } from "../postgres.js";
import { archiveLegacyTextPrimaryKeyTables } from "./legacy.js";
import { seedDefaults } from "./seed-defaults.js";
import { runSchemaSql } from "./sql-loader.js";

let coreSchemaPromise;

export function ensureCoreSchema() {
  if (!coreSchemaPromise) {
    coreSchemaPromise = (async () => {
      await archiveLegacyTextPrimaryKeyTables();
      await runSchemaSql("base-schema.sql", query);
      await runSchemaSql("schema-migrations.sql", query);
      await runSchemaSql("schema-post-seed.sql", query);
      await seedDefaults();
    })();
  }
  return coreSchemaPromise;
}
