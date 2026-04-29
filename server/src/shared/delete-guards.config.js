export const referenceDeleteChecks = {
  departments: [{ label: "employee", sql: "SELECT COUNT(*)::int AS count FROM employees WHERE department_id = $1" }],
  designations: [{ label: "employee", sql: "SELECT COUNT(*)::int AS count FROM employees WHERE designation_id = $1" }],
  uom: [
    { label: "UOM wiring", sql: "SELECT COUNT(*)::int AS count FROM uom_wiring WHERE uom_id = $1" },
    { label: "utility record", sql: "SELECT COUNT(*)::int AS count FROM utility_records ur JOIN uom u ON lower(u.name) = lower(ur.uom) WHERE u.id = $1" },
  ],
  sources: [
    { label: "source wiring", sql: "SELECT COUNT(*)::int AS count FROM source_wiring WHERE source_id = $1" },
    { label: "utility record", sql: "SELECT COUNT(*)::int AS count FROM utility_records WHERE source_id = $1" },
  ],
  suppliers: [],
};

export const companyDeleteChecks = [
  { label: "employee", sql: "SELECT COUNT(*)::int AS count FROM employees WHERE company_id = $1" },
  { label: "user access", sql: "SELECT COUNT(*)::int AS count FROM user_companies WHERE company_id = $1" },
  { label: "utility record", sql: "SELECT COUNT(*)::int AS count FROM utility_records WHERE facility_id = $1" },
];
