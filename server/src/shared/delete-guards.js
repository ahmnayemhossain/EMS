import { query } from "./postgres.js";

function createDependencyError(message) {
  const error = new Error(message);
  error.status = 409;
  return error;
}

const referenceDeleteChecks = {
  departments: [
    {
      label: "employee",
      sql: "SELECT COUNT(*)::int AS count FROM employees WHERE department_id = $1",
    },
  ],
  designations: [
    {
      label: "employee",
      sql: "SELECT COUNT(*)::int AS count FROM employees WHERE designation_id = $1",
    },
  ],
  uom: [
    {
      label: "UOM wiring",
      sql: "SELECT COUNT(*)::int AS count FROM uom_wiring WHERE uom_id = $1",
    },
    {
      label: "utility record",
      sql: "SELECT COUNT(*)::int AS count FROM utility_records ur JOIN uom u ON lower(u.name) = lower(ur.uom) WHERE u.id = $1",
    },
  ],
  sources: [
    {
      label: "source wiring",
      sql: "SELECT COUNT(*)::int AS count FROM source_wiring WHERE source_id = $1",
    },
    {
      label: "utility record",
      sql: "SELECT COUNT(*)::int AS count FROM utility_records WHERE source_id = $1",
    },
  ],
  suppliers: [],
};

async function countDependency(sql, id) {
  const result = await query(sql, [id]);
  return Number(result.rows[0]?.count || 0);
}

export async function assertReferenceDeleteAllowed(tableName, id, label) {
  const checks = referenceDeleteChecks[tableName] || [];
  for (const check of checks) {
    const count = await countDependency(check.sql, id);
    if (count > 0) {
      throw createDependencyError(`Cannot delete ${label}. It is used in ${count} ${check.label}${count > 1 ? "s" : ""}.`);
    }
  }
}

export async function assertCompanyDeleteAllowed(id) {
  const checks = [
    { label: "employee", sql: "SELECT COUNT(*)::int AS count FROM employees WHERE company_id = $1" },
    { label: "user access", sql: "SELECT COUNT(*)::int AS count FROM user_companies WHERE company_id = $1" },
    { label: "utility record", sql: "SELECT COUNT(*)::int AS count FROM utility_records WHERE facility_id = $1" },
  ];

  for (const check of checks) {
    const count = await countDependency(check.sql, id);
    if (count > 0) {
      throw createDependencyError(`Cannot delete company. It is used in ${count} ${check.label}${count > 1 ? "s" : ""}.`);
    }
  }
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
  const count = await countDependency(
    `
      SELECT COUNT(*)::int AS count
      FROM utility_records ur
      JOIN uom_wiring uw ON uw.id = $1
      JOIN uom u ON u.id = uw.uom_id
      JOIN utility_types ut ON ut.id = uw.utility_type_id
      WHERE lower(ur.uom) = lower(u.name)
        AND ur.type = ut.key
    `,
    id,
  );

  if (count > 0) {
    throw createDependencyError(`Cannot delete UOM wiring. It is used in ${count} utility record${count > 1 ? "s" : ""}.`);
  }
}

export async function assertSourceWiringDeleteAllowed(id) {
  const count = await countDependency(
    `
      SELECT COUNT(*)::int AS count
      FROM utility_records ur
      JOIN source_wiring sw ON sw.id = $1
      JOIN utility_types ut ON ut.id = sw.utility_type_id
      WHERE ur.source_id = sw.source_id
        AND ur.type = ut.key
    `,
    id,
  );

  if (count > 0) {
    throw createDependencyError(`Cannot delete source wiring. It is used in ${count} utility record${count > 1 ? "s" : ""}.`);
  }
}
