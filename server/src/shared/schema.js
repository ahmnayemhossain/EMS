import { query } from "./postgres.js";
import { hashPassword, readSessionToken, verifySessionToken } from "./auth.js";

const legacyTables = [
  "utility_records",
  "facilities",
  "factories",
  "user_factories",
  "user_roles",
  "role_permissions",
  "users",
  "employees",
  "roles",
  "permissions",
  "departments",
  "designations",
  "companies",
];

const defaultCompanies = [["Fortis Group", "FG", null, null]];

const defaultPermissions = [
  "dashboard:read",
  "dashboard:customize",
  "audit-calendar:read",
  "audit-calendar:write",
  "audit-calendar:update",
  "audit-calendar:delete",
  "companies:read",
  "utilities:read",
  "utilities:write",
  "utilities:update",
  "utilities:delete",
  "chemicals:read",
  "chemicals:write",
  "chemicals:update",
  "chemicals:delete",
  "sds:read",
  "sds:write",
  "sds:update",
  "sds:delete",
  "waste:read",
  "waste:write",
  "waste:update",
  "waste:delete",
  "wastewater:read",
  "wastewater:write",
  "wastewater:update",
  "wastewater:delete",
  "audits:read",
  "audits:write",
  "audits:update",
  "audits:delete",
  "capa:read",
  "capa:write",
  "capa:update",
  "capa:delete",
  "reports:read",
  "reports:export",
  "documents:read",
  "documents:write",
  "documents:update",
  "documents:delete",
  "complaints:read",
  "complaints:write",
  "complaints:update",
  "complaints:delete",
  "complaints:triage",
  "complaints:handle",
  "complaints:export",
  "report-box:read",
  "report-box:write",
  "report-box:update",
  "report-box:delete",
  "incidents:read",
  "incidents:write",
  "incidents:update",
  "incidents:delete",
  "training:read",
  "training:write",
  "training:update",
  "training:delete",
  "notifications:read",
  "notifications:write",
  "notifications:update",
  "notifications:delete",
  "settings:read",
  "settings:manage",
  "settings:employees:read",
  "settings:employees:write",
  "settings:employees:update",
  "settings:employees:delete",
  "settings:users:read",
  "settings:users:write",
  "settings:users:update",
  "settings:users:delete",
  "settings:roles:read",
  "settings:roles:write",
  "settings:roles:update",
  "settings:roles:delete",
  "settings:departments:read",
  "settings:departments:write",
  "settings:departments:update",
  "settings:departments:delete",
  "settings:designations:read",
  "settings:designations:write",
  "settings:designations:update",
  "settings:designations:delete",
  "settings:companies:read",
  "settings:companies:write",
  "settings:companies:update",
  "settings:companies:delete",
  "settings:uom:read",
  "settings:uom:write",
  "settings:uom:update",
  "settings:uom:delete",
  "settings:uom-wiring:read",
  "settings:uom-wiring:write",
  "settings:uom-wiring:update",
  "settings:uom-wiring:delete",
  "settings:sources:read",
  "settings:sources:write",
  "settings:sources:update",
  "settings:sources:delete",
  "settings:source-wiring:read",
  "settings:source-wiring:write",
  "settings:source-wiring:update",
  "settings:source-wiring:delete",
  "settings:suppliers:read",
  "settings:suppliers:write",
  "settings:suppliers:update",
  "settings:suppliers:delete",
];

const legacyPermissionAliases = {
  "dashboard:view": "dashboard:read",
  "audit-calendar:view": "audit-calendar:read",
  "audit-calendar:manage": "audit-calendar:update",
  "factories:view": "companies:read",
  "factories:read": "companies:read",
  "settings:factories:manage": "settings:companies:update",
  "settings:factories:read": "settings:companies:read",
  "settings:factories:write": "settings:companies:write",
  "settings:factories:update": "settings:companies:update",
  "settings:factories:delete": "settings:companies:delete",
  "companies:view": "companies:read",
  "utilities:view": "utilities:read",
  "utilities:manage": "utilities:update",
  "chemicals:view": "chemicals:read",
  "chemicals:manage": "chemicals:update",
  "sds:view": "sds:read",
  "sds:manage": "sds:update",
  "waste:view": "waste:read",
  "waste:manage": "waste:update",
  "wastewater:view": "wastewater:read",
  "wastewater:manage": "wastewater:update",
  "audits:view": "audits:read",
  "audits:manage": "audits:update",
  "capa:view": "capa:read",
  "capa:manage": "capa:update",
  "reports:view": "reports:read",
  "documents:view": "documents:read",
  "documents:manage": "documents:update",
  "complaints:view": "complaints:read",
  "report-box:manage": "report-box:update",
  "incidents:view": "incidents:read",
  "incidents:manage": "incidents:update",
  "training:view": "training:read",
  "training:manage": "training:update",
  "notifications:view": "notifications:read",
  "notifications:manage": "notifications:update",
  "settings:view": "settings:read",
  "settings:employees:manage": "settings:employees:update",
  "settings:users:manage": "settings:users:update",
  "settings:roles:manage": "settings:roles:update",
  "settings:departments:manage": "settings:departments:update",
  "settings:designations:manage": "settings:designations:update",
  "settings:companies:manage": "settings:companies:update",
  "settings:uom:manage": "settings:uom:update",
  "settings:uom-wiring:manage": "settings:uom-wiring:update",
  "settings:sources:manage": "settings:sources:update",
  "settings:source-wiring:manage": "settings:source-wiring:update",
  "settings:suppliers:manage": "settings:suppliers:update",
};

const defaultRoles = [
  ["Admin", "group", "Full access."],
  ["Sustainability", "group", "Monitoring and compliance access."],
  ["Supervisor", "company", "Company operations access."],
  ["Viewer", "company", "Read-only access."],
];

const defaultDepartments = [["IT & ERP Department"]];

const defaultDesignations = [["Jr. Executive"]];

const defaultUtilityTypes = [
  ["electricity", "Electricity"],
  ["water", "Water"],
  ["fuel", "Fuel"],
  ["steam", "Steam"],
  ["refrigerant", "Refrigerant"],
  ["other", "Other"],
];

const defaultUom = [["kWh"], ["m3"], ["L"], ["Nm3"], ["kg"], ["pcs"]];

const defaultUomWiring = [
  ["electricity", "kWh"],
  ["water", "m3"],
  ["fuel", "L"],
  ["steam", "Nm3"],
  ["refrigerant", "kg"],
  ["other", "pcs"],
];

const defaultSources = [["Grid"], ["Generator"], ["Solar"], ["WASA"], ["Deep Tube Well"]];

const defaultSourceWiring = [
  ["electricity", "Grid"],
  ["electricity", "Generator"],
  ["electricity", "Solar"],
  ["water", "WASA"],
  ["water", "Deep Tube Well"],
];

const defaultEmployees = [
  [
    700901,
    "A. H. M Nayem Hossain",
    "Fortis Group",
    "IT & ERP Department",
    "Jr. Executive",
    1,
    "nayem@fortisgroup.local",
    null,
  ],
];

const defaultUsers = [[700901, "700901", "nayem@softnan.com", "active"]];

let coreSchemaPromise;

async function tableExists(tableName) {
  const result = await query("SELECT to_regclass($1) AS name", [
    `public.${tableName}`,
  ]);
  return Boolean(result.rows[0]?.name);
}

async function idColumnType(tableName) {
  const result = await query(
    `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = 'id'
    `,
    [tableName],
  );

  return result.rows[0]?.data_type || null;
}

async function columnType(tableName, columnName) {
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

async function archiveLegacyTextPrimaryKeyTables() {
  const suffix = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  for (const table of legacyTables) {
    if (!(await tableExists(table))) continue;

    const type = await idColumnType(table);
    const numeric = type === "bigint" || type === "integer";
    const utilityRelationIsNumeric =
      table !== "utility_records" ||
      (await columnType(table, "facility_id")) === "bigint";
    if (numeric && utilityRelationIsNumeric) continue;

    await query(`ALTER TABLE ${table} RENAME TO ${table}_legacy_${suffix}`);
  }
}

async function getIdByName(table, name) {
  const result = await query(`SELECT id FROM ${table} WHERE name = $1`, [name]);
  return result.rows[0]?.id ?? null;
}

async function getIdByKey(table, key) {
  const result = await query(`SELECT id FROM ${table} WHERE key = $1`, [key]);
  return result.rows[0]?.id ?? null;
}

async function getEmployeeIdByEmployeeId(employeeId) {
  const result = await query(
    "SELECT id FROM employees WHERE employee_id = $1",
    [employeeId],
  );
  return result.rows[0]?.id ?? null;
}

export async function getCompanyIdByValue(value) {
  return getIdByNumericValue("companies", value);
}

export async function getFacilityIdByValue(value) {
  return getCompanyIdByValue(value);
}

export async function getUserIdByValue(value) {
  return getUserIdFromRequestValue(value);
}

async function getIdByNumericValue(table, value) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) return null;
  const result = await query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0]?.id ?? null;
}

async function getUserIdFromRequestValue(value) {
  const raw = String(value || "").trim();
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    const byId = await getIdByNumericValue("users", numeric);
    if (byId) return byId;
  }

  const legacyUsernames = {
    userone: "1001",
    usertwo: "1002",
    userthree: "1003",
    userfour: "1004",
    userfive: "1005",
    usersix: "1006",
    userseven: "1007",
  };
  const username =
    legacyUsernames[raw] || (raw.startsWith("usr_") ? raw.slice(4) : raw);
  if (!username) return null;
  const result = await query("SELECT id FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0]?.id ?? null;
}

export function ensureCoreSchema() {
  if (!coreSchemaPromise) {
    coreSchemaPromise = (async () => {
      await archiveLegacyTextPrimaryKeyTables();

      await query(`
        CREATE TABLE IF NOT EXISTS companies (
          id BIGSERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          short_name TEXT UNIQUE NOT NULL,
          local_name TEXT,
          address TEXT,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS departments (
          id BIGSERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS designations (
          id BIGSERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS uom (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS utility_types (
          id BIGSERIAL PRIMARY KEY,
          key TEXT UNIQUE NOT NULL,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS uom_wiring (
          id BIGSERIAL PRIMARY KEY,
          uom_id BIGINT NOT NULL REFERENCES uom(id) ON UPDATE CASCADE ON DELETE CASCADE,
          utility_type_id BIGINT NOT NULL REFERENCES utility_types(id) ON UPDATE CASCADE ON DELETE CASCADE,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (uom_id, utility_type_id)
        );

        CREATE TABLE IF NOT EXISTS sources (
          id BIGSERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS source_wiring (
          id BIGSERIAL PRIMARY KEY,
          source_id BIGINT NOT NULL REFERENCES sources(id) ON UPDATE CASCADE ON DELETE CASCADE,
          utility_type_id BIGINT NOT NULL REFERENCES utility_types(id) ON UPDATE CASCADE ON DELETE CASCADE,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (source_id, utility_type_id)
        );

        CREATE TABLE IF NOT EXISTS meters (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          company_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
          utility_type_id BIGINT NOT NULL REFERENCES utility_types(id) ON UPDATE CASCADE ON DELETE RESTRICT,
          source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL,
          uom_id BIGINT NOT NULL REFERENCES uom(id) ON UPDATE CASCADE ON DELETE RESTRICT,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (company_id, utility_type_id, name)
        );

        CREATE TABLE IF NOT EXISTS suppliers (
          id BIGSERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS roles (
          id BIGSERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          scope TEXT NOT NULL DEFAULT 'company',
          description TEXT,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS permissions (
          id BIGSERIAL PRIMARY KEY,
          key TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS employees (
          id BIGSERIAL PRIMARY KEY,
          employee_id INTEGER UNIQUE NOT NULL,
          name TEXT NOT NULL,
          company_id BIGINT REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL,
          department_id BIGINT REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL,
          designation_id BIGINT REFERENCES designations(id) ON UPDATE CASCADE ON DELETE SET NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          joined_on DATE,
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          employee_id BIGINT UNIQUE REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          password_hash TEXT,
          last_login_at TIMESTAMPTZ,
          created_by_user_id BIGINT,
          updated_by_user_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS role_permissions (
          id BIGSERIAL PRIMARY KEY,
          role_id BIGINT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
          permission_id BIGINT NOT NULL REFERENCES permissions(id) ON UPDATE CASCADE ON DELETE CASCADE,
          UNIQUE (role_id, permission_id)
        );

        CREATE TABLE IF NOT EXISTS user_roles (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
          role_id BIGINT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
          UNIQUE (user_id, role_id)
        );

        CREATE TABLE IF NOT EXISTS user_companies (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
          company_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
          UNIQUE (user_id, company_id)
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id BIGSERIAL PRIMARY KEY,
          table_name TEXT NOT NULL,
          row_id TEXT NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
          actor_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
          old_data JSONB,
          new_data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS file_assets (
          id BIGSERIAL PRIMARY KEY,
          module TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id BIGINT NOT NULL,
          company_id BIGINT REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL,
          original_name TEXT NOT NULL,
          stored_name TEXT NOT NULL,
          storage_disk TEXT NOT NULL DEFAULT 'local-cdn',
          storage_path TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          file_size BIGINT NOT NULL,
          uploaded_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_audit_logs_table_row ON audit_logs(table_name, row_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_file_assets_entity ON file_assets(module, entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_file_assets_company ON file_assets(company_id);
      `);

      await query(`
        DO $$
        BEGIN
          IF to_regclass('public.factories') IS NOT NULL THEN
            EXECUTE '
              INSERT INTO companies (
                id, name, short_name, local_name, address, is_active,
                created_by_user_id, updated_by_user_id, created_at, updated_at
              )
              SELECT
                id,
                regexp_replace(name, ''Factory'', ''Company'', ''gi''),
                COALESCE(NULLIF(short_name, ''''), ''COM-'' || id::text),
                local_name,
                address,
                is_active,
                created_by_user_id,
                updated_by_user_id,
                created_at,
                updated_at
              FROM factories
              ON CONFLICT (id) DO NOTHING
            ';

            PERFORM setval(
              pg_get_serial_sequence('companies', 'id'),
              GREATEST(
                COALESCE((SELECT MAX(id) FROM companies), 1),
                COALESCE((SELECT last_value FROM companies_id_seq), 1)
              ),
              true
            );
          END IF;

          IF to_regclass('public.facilities') IS NOT NULL THEN
            EXECUTE '
              INSERT INTO companies (
                id, name, short_name, is_active, created_at, updated_at
              )
              SELECT
                id,
                regexp_replace(name, ''Factory'', ''Company'', ''gi''),
                COALESCE(NULLIF(short_code, ''''), ''COM-'' || id::text),
                is_active,
                created_at,
                updated_at
              FROM facilities
              ON CONFLICT (id) DO NOTHING
            ';

            PERFORM setval(
              pg_get_serial_sequence('companies', 'id'),
              GREATEST(
                COALESCE((SELECT MAX(id) FROM companies), 1),
                COALESCE((SELECT last_value FROM companies_id_seq), 1)
              ),
              true
            );
          END IF;
        END $$;

        ALTER TABLE companies DROP COLUMN IF EXISTS code;
        ALTER TABLE companies DROP COLUMN IF EXISTS short_code;
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS short_name TEXT;
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS local_name TEXT;
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE companies DROP COLUMN IF EXISTS location;
        ALTER TABLE companies DROP COLUMN IF EXISTS risk_level;
        ALTER TABLE companies DROP COLUMN IF EXISTS type;
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        UPDATE companies
        SET
          name = regexp_replace(name, 'Factory', 'Company', 'gi'),
          local_name = CASE
            WHEN local_name IS NULL THEN NULL
            ELSE regexp_replace(local_name, 'ফ্যাক্টরি', 'কোম্পানি', 'gi')
          END
        WHERE name ~* 'Factory'
           OR COALESCE(local_name, '') LIKE '%ফ্যাক্টরি%';
        UPDATE companies
        SET short_name = COALESCE(NULLIF(short_name, ''), 'COM-' || id::text)
        WHERE short_name IS NULL OR short_name = '';
        ALTER TABLE companies ALTER COLUMN short_name SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_short_name_unique ON companies (short_name);
        ALTER TABLE departments DROP COLUMN IF EXISTS code;
        ALTER TABLE designations DROP COLUMN IF EXISTS code;
        ALTER TABLE roles DROP COLUMN IF EXISTS code;
        ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
        ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE designations ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE designations ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE uom DROP COLUMN IF EXISTS code;
        ALTER TABLE uom ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE uom ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        DO $$
        DECLARE
          uom_name_unique record;
        BEGIN
          FOR uom_name_unique IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'public.uom'::regclass
              AND contype = 'u'
          LOOP
            EXECUTE format('ALTER TABLE uom DROP CONSTRAINT IF EXISTS %I', uom_name_unique.conname);
          END LOOP;
        END $$;
        DROP INDEX IF EXISTS idx_uom_name_utility_type_unique;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_uom_name_unique ON uom (name);
        ALTER TABLE uom_wiring ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE uom_wiring ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE sources DROP COLUMN IF EXISTS code;
        ALTER TABLE sources ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE sources ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE source_wiring ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE source_wiring ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE meters ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE meters ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE meters ADD COLUMN IF NOT EXISTS source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL;
        ALTER TABLE meters ADD COLUMN IF NOT EXISTS uom_id BIGINT REFERENCES uom(id) ON UPDATE CASCADE ON DELETE RESTRICT;
        ALTER TABLE suppliers DROP COLUMN IF EXISTS code;
        ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE users DROP COLUMN IF EXISTS code;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;
        ALTER TABLE employees DROP COLUMN IF EXISTS code;
        ALTER TABLE employees ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL;
        ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
        ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'employees'
              AND column_name = 'factory_id'
          ) THEN
            EXECUTE '
              UPDATE employees
              SET company_id = factory_id
              WHERE company_id IS NULL
                AND factory_id IN (SELECT id FROM companies)
            ';
          END IF;

          IF to_regclass('public.user_factories') IS NOT NULL THEN
            EXECUTE '
              INSERT INTO user_companies (user_id, company_id)
              SELECT user_id, factory_id
              FROM user_factories
              WHERE factory_id IN (SELECT id FROM companies)
              ON CONFLICT (user_id, company_id) DO NOTHING
            ';
          END IF;
        END $$;

        DO $$
        DECLARE
          fk record;
        BEGIN
          IF to_regclass('public.utility_records') IS NOT NULL THEN
            FOR fk IN
              SELECT conname
              FROM pg_constraint
              WHERE conrelid = 'public.utility_records'::regclass
                AND contype = 'f'
                AND confrelid IN (
                  COALESCE(to_regclass('public.factories'), 'public.companies'::regclass),
                  'public.companies'::regclass
                )
            LOOP
              EXECUTE format('ALTER TABLE utility_records DROP CONSTRAINT IF EXISTS %I', fk.conname);
            END LOOP;

            IF NOT EXISTS (
              SELECT 1
              FROM pg_constraint
              WHERE conrelid = 'public.utility_records'::regclass
                AND conname = 'utility_records_facility_id_companies_fkey'
            ) THEN
              ALTER TABLE utility_records
                ADD CONSTRAINT utility_records_facility_id_companies_fkey
                FOREIGN KEY (facility_id)
                REFERENCES companies(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT;
            END IF;
          END IF;

          ALTER TABLE employees DROP COLUMN IF EXISTS factory_id;
          DROP TABLE IF EXISTS user_factories;
          DROP TABLE IF EXISTS factories;
        END $$;

        UPDATE users u
        SET username = e.employee_id::text,
            email = e.email,
            password_hash = COALESCE(u.password_hash, e.employee_id::text),
            updated_at = NOW()
        FROM employees e
        WHERE u.employee_id = e.id
          AND (u.username IS DISTINCT FROM e.employee_id::text OR u.email IS DISTINCT FROM e.email);

        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'companies_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE companies
              ADD CONSTRAINT companies_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'companies_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE companies
              ADD CONSTRAINT companies_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'users_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE users
              ADD CONSTRAINT users_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'roles_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE roles
              ADD CONSTRAINT roles_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'roles_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE roles
              ADD CONSTRAINT roles_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'departments_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE departments
              ADD CONSTRAINT departments_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'departments_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE departments
              ADD CONSTRAINT departments_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'designations_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE designations
              ADD CONSTRAINT designations_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'designations_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE designations
              ADD CONSTRAINT designations_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'users_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE users
              ADD CONSTRAINT users_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uom_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE uom
              ADD CONSTRAINT uom_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uom_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE uom
              ADD CONSTRAINT uom_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uom_wiring_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE uom_wiring
              ADD CONSTRAINT uom_wiring_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uom_wiring_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE uom_wiring
              ADD CONSTRAINT uom_wiring_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'sources_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE sources
              ADD CONSTRAINT sources_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'sources_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE sources
              ADD CONSTRAINT sources_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'source_wiring_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE source_wiring
              ADD CONSTRAINT source_wiring_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'source_wiring_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE source_wiring
              ADD CONSTRAINT source_wiring_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'meters_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE meters
              ADD CONSTRAINT meters_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'meters_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE meters
              ADD CONSTRAINT meters_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE suppliers
              ADD CONSTRAINT suppliers_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE suppliers
              ADD CONSTRAINT suppliers_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'employees_created_by_user_id_fkey'
          ) THEN
            ALTER TABLE employees
              ADD CONSTRAINT employees_created_by_user_id_fkey
              FOREIGN KEY (created_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'employees_updated_by_user_id_fkey'
          ) THEN
            ALTER TABLE employees
              ADD CONSTRAINT employees_updated_by_user_id_fkey
              FOREIGN KEY (updated_by_user_id)
              REFERENCES users(id)
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;
        END $$;
      `);

      for (const [name, shortName, localName, address] of defaultCompanies) {
        await query(
          `
            INSERT INTO companies (name, short_name, local_name, address)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (name) DO UPDATE
            SET
              name = EXCLUDED.name,
              short_name = COALESCE(NULLIF(companies.short_name, ''), EXCLUDED.short_name),
              local_name = COALESCE(companies.local_name, EXCLUDED.local_name),
              address = COALESCE(companies.address, EXCLUDED.address)
          `,
          [name, shortName, localName, address],
        );
      }

      for (const [name] of defaultDepartments) {
        await query(
          `
            INSERT INTO departments (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          `,
          [name],
        );
      }

      for (const [name] of defaultDesignations) {
        await query(
          `
            INSERT INTO designations (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          `,
          [name],
        );
      }

      for (const [key, name] of defaultUtilityTypes) {
        await query(
          `
            INSERT INTO utility_types (key, name)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE
            SET name = EXCLUDED.name
          `,
          [key, name],
        );
      }

      for (const [name] of defaultUom) {
        await query(
          `
            INSERT INTO uom (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE
            SET name = EXCLUDED.name
          `,
          [name],
        );
      }

      for (const [utilityTypeKey, uomName] of defaultUomWiring) {
        await query(
          `
            INSERT INTO uom_wiring (utility_type_id, uom_id)
            SELECT ut.id, u.id
            FROM utility_types ut
            JOIN uom u ON u.name = $2
            WHERE ut.key = $1
            ON CONFLICT (uom_id, utility_type_id) DO NOTHING
          `,
          [utilityTypeKey, uomName],
        );
      }

      for (const [name] of defaultSources) {
        await query(
          `
            INSERT INTO sources (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE
            SET name = EXCLUDED.name
          `,
          [name],
        );
      }

      for (const [utilityTypeKey, sourceName] of defaultSourceWiring) {
        await query(
          `
            INSERT INTO source_wiring (utility_type_id, source_id)
            SELECT ut.id, s.id
            FROM utility_types ut
            JOIN sources s ON s.name = $2
            WHERE ut.key = $1
            ON CONFLICT (source_id, utility_type_id) DO NOTHING
          `,
          [utilityTypeKey, sourceName],
        );
      }

      await query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'uom'
              AND column_name = 'utility_type'
          ) THEN
            INSERT INTO uom_wiring (uom_id, utility_type_id)
            SELECT DISTINCT u.id, ut.id
            FROM uom u
            JOIN utility_types ut ON ut.key = lower(u.utility_type)
            WHERE COALESCE(u.utility_type, '') <> ''
            ON CONFLICT (uom_id, utility_type_id) DO NOTHING;
          END IF;
        END $$;
      `);

      await query("ALTER TABLE uom DROP COLUMN IF EXISTS utility_type");

      for (const key of defaultPermissions) {
        await query(
          "INSERT INTO permissions (key) VALUES ($1) ON CONFLICT (key) DO NOTHING",
          [key],
        );
      }

      for (const [legacyKey, canonicalKey] of Object.entries(
        legacyPermissionAliases,
      )) {
        await query(
          `
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT rp.role_id, canonical.id
            FROM role_permissions rp
            JOIN permissions legacy ON legacy.id = rp.permission_id
            JOIN permissions canonical ON canonical.key = $2
            WHERE legacy.key = $1
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `,
          [legacyKey, canonicalKey],
        );
      }

      await query(
        `
          DELETE FROM role_permissions rp
          USING permissions p
          WHERE p.id = rp.permission_id
            AND p.key = ANY($1::text[])
        `,
        [Object.keys(legacyPermissionAliases)],
      );
      await query("DELETE FROM permissions WHERE key = ANY($1::text[])", [
        Object.keys(legacyPermissionAliases),
      ]);

      for (const [name, scope, description] of defaultRoles) {
        await query(
          `
            INSERT INTO roles (name, scope, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO UPDATE
            SET name = EXCLUDED.name, scope = EXCLUDED.scope, description = EXCLUDED.description
          `,
          [name, scope, description],
        );
      }

      for (const permissionKey of defaultPermissions) {
        const roleId = await getIdByName("roles", "Admin");
        const permissionId = await getIdByKey("permissions", permissionKey);
        await query(
          `
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES ($1, $2)
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `,
          [roleId, permissionId],
        );
      }

      for (const [
        employeeId,
        name,
        companyName,
        departmentName,
        designationName,
        isActive,
        email,
        phone,
      ] of defaultEmployees) {
        const companyId = await getIdByName("companies", companyName);
        const departmentId = await getIdByName("departments", departmentName);
        const designationId = await getIdByName(
          "designations",
          designationName,
        );

        await query(
          `
            INSERT INTO employees (
              employee_id, name, company_id, department_id,
              designation_id, is_active, email, phone, joined_on
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
            ON CONFLICT (employee_id) DO UPDATE
            SET
              name = EXCLUDED.name,
              company_id = COALESCE(employees.company_id, EXCLUDED.company_id),
              department_id = COALESCE(employees.department_id, EXCLUDED.department_id),
              designation_id = COALESCE(employees.designation_id, EXCLUDED.designation_id),
              is_active = EXCLUDED.is_active,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone
          `,
          [
            employeeId,
            name,
            companyId,
            departmentId,
            designationId,
            isActive,
            email,
            phone,
          ],
        );
      }

      for (const [employeeId, username, email, status] of defaultUsers) {
        const employeeDbId = await getEmployeeIdByEmployeeId(employeeId);
        const initialPasswordHash = hashPassword(username);
        await query(
          `
            UPDATE users
            SET employee_id = $1,
                username = $2,
                email = $3,
                status = $4,
                password_hash = COALESCE(password_hash, $5),
                updated_at = NOW()
            WHERE employee_id = $1 OR username = $2 OR email = $3
          `,
          [employeeDbId, username, email, status, initialPasswordHash],
        );
        await query(
          `
            INSERT INTO users (employee_id, username, email, status, password_hash)
            SELECT $1, $2, $3, $4, $5
            WHERE NOT EXISTS (
              SELECT 1 FROM users WHERE employee_id = $1 OR username = $2 OR email = $3
            )
          `,
          [employeeDbId, username, email, status, initialPasswordHash],
        );
      }

      for (const [username, roleName] of [["700901", "Admin"]]) {
        const userId = await getUserIdFromRequestValue(username);
        const roleId = await getIdByName("roles", roleName);
        await query(
          `
            INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, role_id) DO NOTHING
          `,
          [userId, roleId],
        );
      }

      await query(`
        INSERT INTO user_companies (user_id, company_id)
        SELECT u.id, e.company_id
        FROM users u
        JOIN employees e ON e.id = u.employee_id
        WHERE e.company_id IS NOT NULL
        ON CONFLICT (user_id, company_id) DO NOTHING
      `);
    })();
  }

  return coreSchemaPromise;
}

export function getRequestUserValue(req) {
  const session = verifySessionToken(readSessionToken(req));
  return String(
    session?.sub ||
      req.get("x-user-id") ||
      process.env.DEFAULT_USER_ID ||
      "700901",
  );
}
