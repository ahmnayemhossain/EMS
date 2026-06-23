import { readdir } from "node:fs/promises";
import { query } from "../postgres.js";
import { seedDefaults } from "./seed-defaults.js";

let coreSchemaPromise;
let expectedMigrationNamesPromise;

const prismaMigrationsDir = new URL("../../../../prisma/migrations/", import.meta.url);
const coreTableNames = ["users", "companies", "utility_records"];

export function ensureCoreSchema() {
  if (!coreSchemaPromise) {
    coreSchemaPromise = (async () => {
      const seed = String(process.env.SEED_DEFAULTS ?? "true").toLowerCase() !== "false";

      await ensurePrismaMigrations();

      if (seed) {
        await seedDefaults();
      }
    })();
  }
  return coreSchemaPromise;
}

async function ensurePrismaMigrations() {
  const expectedMigrationNames = await listExpectedMigrationNames();

  if (!expectedMigrationNames.length) {
    throw createSetupError(
      "Prisma migrations are missing. Restore `server/prisma/migrations` before starting the API.",
    );
  }

  const migrationsTableExists = await tableExists("_prisma_migrations");
  const hasCoreTables = await hasExistingCoreTables();

  if (!migrationsTableExists) {
    throw hasCoreTables ? createBaselineError() : createDeployError();
  }

  const result = await query(
    `
      SELECT migration_name, finished_at, rolled_back_at
      FROM _prisma_migrations
      ORDER BY started_at ASC
    `,
  );

  const incompleteMigrations = result.rows.filter(
    (row) => !row.finished_at || row.rolled_back_at,
  );
  if (incompleteMigrations.length) {
    throw createSetupError(
      "Prisma migration history is incomplete. Run `npm run prisma:migrate:status` and then `npm run prisma:migrate:deploy` in `server/`.",
    );
  }

  if (!result.rows.length && hasCoreTables) {
    throw createBaselineError();
  }

  const appliedMigrationNames = new Set(result.rows.map((row) => row.migration_name));
  const pendingMigrationNames = expectedMigrationNames.filter(
    (migrationName) => !appliedMigrationNames.has(migrationName),
  );

  if (pendingMigrationNames.length) {
    throw createSetupError(
      `Pending Prisma migrations detected: ${pendingMigrationNames.join(", ")}. Run \`npm run prisma:migrate:deploy\` in \`server/\` and restart the API.`,
    );
  }
}

async function listExpectedMigrationNames() {
  if (!expectedMigrationNamesPromise) {
    expectedMigrationNamesPromise = loadExpectedMigrationNames();
  }
  return expectedMigrationNamesPromise;
}

async function loadExpectedMigrationNames() {
  const entries = await readdir(prismaMigrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function tableExists(tableName) {
  const result = await query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName],
  );
  return Boolean(result.rows[0]?.exists);
}

async function hasExistingCoreTables() {
  const result = await query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
      ) AS exists
    `,
    [coreTableNames],
  );
  return Boolean(result.rows[0]?.exists);
}

function createBaselineError() {
  return createSetupError(
    "Legacy EMS tables exist without Prisma migration history. Run `npm run prisma:migrate:baseline` in `server/`, then restart the API.",
  );
}

function createDeployError() {
  return createSetupError(
    "Database schema is not initialized. Run `npm run prisma:migrate:deploy` in `server/`, then `npm run prisma:seed`, and restart the API.",
  );
}

function createSetupError(message) {
  const error = new Error(message);
  error.status = 500;
  return error;
}
