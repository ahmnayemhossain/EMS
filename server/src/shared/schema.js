import { query } from "./postgres.js";

const legacyTables = [
  "utility_records",
  "user_roles",
  "role_permissions",
  "users",
  "employees",
  "roles",
  "permissions",
  "departments",
  "designations",
  "facilities",
];

const defaultFacilities = [
  ["fac_garments_a", "Factory A", "Factory A", "garments"],
  ["fac_knitting_b", "Factory B", "Factory B", "knitting"],
  ["fac_dyeing_d", "Factory C", "Factory C", "dyeing_wet_processing"],
  ["fac_shoe_s", "Factory D", "Factory D", "shoe"],
  ["fac_resort_r", "Site E", "SITE-E", "resort"],
  ["fac_kadl", "Factory F", "Factory F", "dyeing_wet_processing"],
  ["fac_dt_resort", "Site G", "SITE-G", "resort"],
  ["fac_rsbl", "Factory H", "Factory H", "garments"],
];

const defaultPermissions = [
  "dashboard:view",
  "utilities:manage",
  "chemicals:manage",
  "sds:manage",
  "waste:manage",
  "wastewater:manage",
  "audits:manage",
  "capa:manage",
  "documents:manage",
  "complaints:triage",
  "complaints:handle",
  "settings:manage",
];

const defaultRoles = [
  ["role_admin", "Admin", "group", "Full access."],
  ["role_sustainability", "Sustainability", "group", "Monitoring and compliance access."],
  ["role_supervisor", "Supervisor", "factory", "Factory operations access."],
  ["role_viewer", "Viewer", "factory", "Read-only access."],
];

const defaultDepartments = [
  ["dept_ehs", "EHS"],
  ["dept_compliance", "Compliance"],
  ["dept_utility", "Utility"],
  ["dept_admin", "Admin"],
  ["dept_production", "Production"],
  ["dept_maintenance", "Maintenance"],
];

const defaultDesignations = [
  ["desig_officer", "Officer"],
  ["desig_executive", "Executive"],
  ["desig_engineer", "Engineer"],
  ["desig_supervisor", "Supervisor"],
  ["desig_manager", "Manager"],
  ["desig_technician", "Technician"],
];

const defaultEmployees = [
  ["emp_1001", 1001, "User One", "fac_garments_a", "dept_ehs", "desig_officer", 1, "userone@example.test", null],
  ["emp_1002", 1002, "User Two", "fac_knitting_b", "dept_compliance", "desig_executive", 1, "usertwo@example.test", null],
  ["emp_1003", 1003, "User Three", "fac_dyeing_d", "dept_utility", "desig_engineer", 1, "userthree@example.test", null],
  ["emp_1004", 1004, "User Four", "fac_shoe_s", "dept_admin", "desig_supervisor", 1, "userfour@example.test", null],
];

const defaultUsers = [
  ["usr_userone", "emp_1001", "userone", "userone@example.test", "active"],
  ["usr_usertwo", "emp_1002", "usertwo", "usertwo@example.test", "active"],
  ["usr_userfour", "emp_1004", "userfour", "userfour@example.test", "active"],
];

let coreSchemaPromise;

async function tableExists(tableName) {
  const result = await query("SELECT to_regclass($1) AS name", [`public.${tableName}`]);
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
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

  for (const table of legacyTables) {
    if (!(await tableExists(table))) continue;

    const type = await idColumnType(table);
    const numeric = type === "bigint" || type === "integer";
    const utilityRelationIsNumeric =
      table !== "utility_records" || (await columnType(table, "facility_id")) === "bigint";
    if (numeric && utilityRelationIsNumeric) continue;

    await query(`ALTER TABLE ${table} RENAME TO ${table}_legacy_${suffix}`);
  }
}

async function getIdByCode(table, code) {
  const result = await query(`SELECT id FROM ${table} WHERE code = $1`, [code]);
  return result.rows[0]?.id ?? null;
}

async function getIdByKey(table, key) {
  const result = await query(`SELECT id FROM ${table} WHERE key = $1`, [key]);
  return result.rows[0]?.id ?? null;
}

export async function getFacilityIdByCode(code) {
  return getIdByCode("facilities", code);
}

export async function getUserIdByCode(code) {
  return getIdByCode("users", code);
}

export async function getUserCodeById(id) {
  if (!id) return null;
  const result = await query("SELECT code FROM users WHERE id = $1", [id]);
  return result.rows[0]?.code ?? null;
}

export function ensureCoreSchema() {
  if (!coreSchemaPromise) {
    coreSchemaPromise = (async () => {
      await archiveLegacyTextPrimaryKeyTables();

      await query(`
        CREATE TABLE IF NOT EXISTS facilities (
          id BIGSERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          short_code TEXT NOT NULL,
          type TEXT NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS departments (
          id BIGSERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS designations (
          id BIGSERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT UNIQUE NOT NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS roles (
          id BIGSERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          scope TEXT NOT NULL DEFAULT 'factory',
          description TEXT,
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
          code TEXT UNIQUE NOT NULL,
          employee_id INTEGER UNIQUE NOT NULL,
          name TEXT NOT NULL,
          facility_id BIGINT REFERENCES facilities(id) ON UPDATE CASCADE ON DELETE SET NULL,
          department_id BIGINT REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL,
          designation_id BIGINT REFERENCES designations(id) ON UPDATE CASCADE ON DELETE SET NULL,
          is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          joined_on DATE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          employee_id BIGINT UNIQUE REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          password_hash TEXT,
          last_login_at TIMESTAMPTZ,
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
      `);

      for (const [code, name, shortCode, type] of defaultFacilities) {
        await query(
          `
            INSERT INTO facilities (code, name, short_code, type)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO UPDATE
            SET name = EXCLUDED.name, short_code = EXCLUDED.short_code, type = EXCLUDED.type
          `,
          [code, name, shortCode, type],
        );
      }

      for (const [code, name] of defaultDepartments) {
        await query(
          `
            INSERT INTO departments (code, name)
            VALUES ($1, $2)
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
          `,
          [code, name],
        );
      }

      for (const [code, name] of defaultDesignations) {
        await query(
          `
            INSERT INTO designations (code, name)
            VALUES ($1, $2)
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
          `,
          [code, name],
        );
      }

      for (const key of defaultPermissions) {
        await query("INSERT INTO permissions (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [key]);
      }

      for (const [code, name, scope, description] of defaultRoles) {
        await query(
          `
            INSERT INTO roles (code, name, scope, description)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO UPDATE
            SET name = EXCLUDED.name, scope = EXCLUDED.scope, description = EXCLUDED.description
          `,
          [code, name, scope, description],
        );
      }

      for (const permissionKey of defaultPermissions) {
        const roleId = await getIdByCode("roles", "role_admin");
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

      for (const [roleCode, permissionKey] of [
        ["role_sustainability", "dashboard:view"],
        ["role_sustainability", "utilities:manage"],
        ["role_supervisor", "dashboard:view"],
        ["role_supervisor", "utilities:manage"],
        ["role_viewer", "dashboard:view"],
      ]) {
        const roleId = await getIdByCode("roles", roleCode);
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
        code,
        employeeId,
        name,
        facilityCode,
        departmentCode,
        designationCode,
        isActive,
        email,
        phone,
      ] of defaultEmployees) {
        const facilityId = await getIdByCode("facilities", facilityCode);
        const departmentId = await getIdByCode("departments", departmentCode);
        const designationId = await getIdByCode("designations", designationCode);

        await query(
          `
            INSERT INTO employees (
              code, employee_id, name, facility_id, department_id,
              designation_id, is_active, email, phone, joined_on
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
            ON CONFLICT (code) DO UPDATE
            SET
              employee_id = EXCLUDED.employee_id,
              name = EXCLUDED.name,
              facility_id = EXCLUDED.facility_id,
              department_id = EXCLUDED.department_id,
              designation_id = EXCLUDED.designation_id,
              is_active = EXCLUDED.is_active,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone
          `,
          [code, employeeId, name, facilityId, departmentId, designationId, isActive, email, phone],
        );
      }

      for (const [code, employeeCode, username, email, status] of defaultUsers) {
        const employeeDbId = await getIdByCode("employees", employeeCode);
        await query(
          `
            INSERT INTO users (code, employee_id, username, email, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (code) DO UPDATE
            SET employee_id = EXCLUDED.employee_id, username = EXCLUDED.username, email = EXCLUDED.email, status = EXCLUDED.status
          `,
          [code, employeeDbId, username, email, status],
        );
      }

      for (const [userCode, roleCode] of [
        ["usr_userone", "role_admin"],
        ["usr_usertwo", "role_sustainability"],
        ["usr_userfour", "role_supervisor"],
      ]) {
        const userId = await getIdByCode("users", userCode);
        const roleId = await getIdByCode("roles", roleCode);
        await query(
          `
            INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, role_id) DO NOTHING
          `,
          [userId, roleId],
        );
      }
    })();
  }

  return coreSchemaPromise;
}

export function getRequestUserCode(req) {
  return String(req.get("x-user-id") || process.env.DEFAULT_USER_ID || "usr_userone");
}
