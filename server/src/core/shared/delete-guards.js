import { companyDeleteChecks, referenceDeleteChecks } from "./delete-guards.config.js";
import { assertDependencyChecks, countDependency, createDependencyError } from "./delete-guards.helpers.js";

export async function assertReferenceDeleteAllowed(tableName, id, label) {
  const checks = referenceDeleteChecks[tableName] || [];
  return assertDependencyChecks(checks, id, (check, count) => `Cannot delete ${label}. It is used in ${count} ${check.label}${count > 1 ? "s" : ""}.`);
}

export async function assertCompanyDeleteAllowed(id) {
  return assertDependencyChecks(companyDeleteChecks, id, (check, count) => `Cannot delete company. It is used in ${count} ${check.label}${count > 1 ? "s" : ""}.`);
}

export async function assertEmployeeDeleteAllowed(id) {
  const count = await countDependency("SELECT COUNT(*)::int AS count FROM users WHERE employee_id = $1", id);
  if (count > 0) {
    throw createDependencyError(`Cannot delete employee. It is linked to ${count} user account${count > 1 ? "s" : ""}.`);
  }
}

export async function assertRoleDeleteAllowed(id) {
  const count = await countDependency("SELECT COUNT(*)::int AS count FROM user_roles WHERE role_id = $1", id);
  if (count > 0) {
    throw createDependencyError(`Cannot delete role. It is assigned to ${count} user${count > 1 ? "s" : ""}.`);
  }
}

export async function assertUomWiringDeleteAllowed(id) {
  const count = await countDependency(getUomWiringUsageSql(), id);
  if (count > 0) {
    throw createDependencyError(`Cannot delete UOM wiring. It is used in ${count} utility record${count > 1 ? "s" : ""}.`);
  }
}

export async function assertSourceWiringDeleteAllowed(id) {
  const count = await countDependency(getSourceWiringUsageSql(), id);
  if (count > 0) {
    throw createDependencyError(`Cannot delete source wiring. It is used in ${count} utility record${count > 1 ? "s" : ""}.`);
  }
}

function getUomWiringUsageSql() {
  return `
    SELECT COUNT(*)::int AS count
    FROM utility_records ur
    JOIN uom_wiring uw ON uw.id = $1
    JOIN uom u ON u.id = uw.uom_id
    JOIN utility_types ut ON ut.id = uw.utility_type_id
    WHERE lower(ur.uom) = lower(u.name)
      AND ur.type = ut.key
  `;
}

function getSourceWiringUsageSql() {
  return `
    SELECT COUNT(*)::int AS count
    FROM utility_records ur
    JOIN source_wiring sw ON sw.id = $1
    JOIN utility_types ut ON ut.id = sw.utility_type_id
    WHERE ur.source_id = sw.source_id
      AND ur.type = ut.key
  `;
}
