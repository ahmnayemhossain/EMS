import { query } from "../postgres.js";
import { defaultPermissions } from "./default-permissions.js";
import { legacyPermissionAliases } from "./legacy-permission-aliases.js";
import { defaultCompanies, defaultDepartments, defaultDesignations, defaultEmployees, defaultRoles, defaultSourceWiring, defaultSources, defaultUom, defaultUomWiring, defaultUsers, defaultUtilityTypes } from "./seed-data.js";
import { assignAdminPermissions, assignUserRole, insertByName, insertWiring, upsertDefaultUsers } from "./seed-helpers.js";
import { getIdByName } from "./lookups.js";

export async function seedDefaults() {
  for (const [name, shortName, localName, address] of defaultCompanies) await query(`INSERT INTO companies (name, short_name, local_name, address) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name, short_name = COALESCE(NULLIF(companies.short_name, ''), EXCLUDED.short_name), local_name = COALESCE(companies.local_name, EXCLUDED.local_name), address = COALESCE(companies.address, EXCLUDED.address)`, [name, shortName, localName, address]);
  await insertByName("departments", defaultDepartments);
  await insertByName("designations", defaultDesignations);
  for (const [key, name] of defaultUtilityTypes) await query(`INSERT INTO utility_types (key, name) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name`, [key, name]);
  await insertByName("uom", defaultUom);
  await insertWiring("uom_wiring", "utility_type_id", "uom", "uom_id", defaultUomWiring);
  await insertByName("sources", defaultSources);
  await insertWiring("source_wiring", "utility_type_id", "sources", "source_id", defaultSourceWiring);
  await seedPermissions();
  await seedRoles();
  await seedEmployees();
  await upsertDefaultUsers(defaultUsers);
  await assignUserRole("700901", "Admin");
  await query(`INSERT INTO user_companies (user_id, company_id) SELECT u.id, e.company_id FROM users u JOIN employees e ON e.id = u.employee_id WHERE e.company_id IS NOT NULL ON CONFLICT (user_id, company_id) DO NOTHING`);
}

async function seedPermissions() {
  for (const key of defaultPermissions) await query("INSERT INTO permissions (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [key]);
  for (const [legacyKey, canonicalKey] of Object.entries(legacyPermissionAliases)) await query(`INSERT INTO role_permissions (role_id, permission_id) SELECT rp.role_id, canonical.id FROM role_permissions rp JOIN permissions legacy ON legacy.id = rp.permission_id JOIN permissions canonical ON canonical.key = $2 WHERE legacy.key = $1 ON CONFLICT (role_id, permission_id) DO NOTHING`, [legacyKey, canonicalKey]);
  await query(`DELETE FROM role_permissions rp USING permissions p WHERE p.id = rp.permission_id AND p.key = ANY($1::text[])`, [Object.keys(legacyPermissionAliases)]);
  await query("DELETE FROM permissions WHERE key = ANY($1::text[])", [Object.keys(legacyPermissionAliases)]);
}

async function seedRoles() {
  for (const [name, scope, description] of defaultRoles) await query(`INSERT INTO roles (name, scope, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name, scope = EXCLUDED.scope, description = EXCLUDED.description`, [name, scope, description]);
  await assignAdminPermissions(defaultPermissions);
}

async function seedEmployees() {
  for (const [employeeId, name, companyName, departmentName, designationName, isActive, email, phone] of defaultEmployees) {
    const companyId = await getIdByName("companies", companyName);
    const departmentId = await getIdByName("departments", departmentName);
    const designationId = await getIdByName("designations", designationName);
    await query(`INSERT INTO employees (employee_id, name, company_id, department_id, designation_id, is_active, email, phone, joined_on) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE) ON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, company_id = COALESCE(employees.company_id, EXCLUDED.company_id), department_id = COALESCE(employees.department_id, EXCLUDED.department_id), designation_id = COALESCE(employees.designation_id, EXCLUDED.designation_id), is_active = EXCLUDED.is_active, email = EXCLUDED.email, phone = EXCLUDED.phone`, [employeeId, name, companyId, departmentId, designationId, isActive, email, phone]);
  }
}
