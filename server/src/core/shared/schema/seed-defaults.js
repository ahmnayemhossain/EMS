import { query } from "../postgres.js";
import { defaultPermissions } from "./default-permissions.js";
import { legacyPermissionAliases } from "./legacy-permission-aliases.js";
import { defaultCompanies, defaultDepartments, defaultDesignations, defaultEmployees, defaultMeters, defaultRoles, defaultSourceWiring, defaultSources, defaultUom, defaultUomWiring, defaultUsers, defaultUtilityTypes } from "./seed-data.js";
import { assignAdminPermissions, assignUserRole, insertByName, insertWiring, upsertDefaultUsers } from "./seed-helpers.js";
import { getIdByKey, getIdByName } from "./lookups.js";

export async function seedDefaults() {
  for (const [name, shortName, localName, address] of defaultCompanies) await query(`INSERT INTO companies (name, short_name, local_name, address) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name, short_name = COALESCE(NULLIF(companies.short_name, ''), EXCLUDED.short_name), local_name = COALESCE(companies.local_name, EXCLUDED.local_name), address = COALESCE(companies.address, EXCLUDED.address)`, [name, shortName, localName, address]);
  await insertByName("departments", defaultDepartments);
  await insertByName("designations", defaultDesignations);
  for (const [key, name] of defaultUtilityTypes) await query(`INSERT INTO utility_types (key, name) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name`, [key, name]);
  await insertByName("uom", defaultUom);
  await insertWiring("uom_wiring", "utility_type_id", "uom", "uom_id", defaultUomWiring);
  await insertByName("sources", defaultSources);
  await insertWiring("source_wiring", "utility_type_id", "sources", "source_id", defaultSourceWiring);
  await seedMeters();
  await seedUtilityConversionRules();
  await seedReportDefinitions();
  await seedEmailNotificationSettings();
  await seedPermissions();
  await seedRoles();
  await seedApprovalHierarchy();
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
  await seedUtilitiesRolePermissions();
}

async function seedApprovalHierarchy() {
  const steps = [
    ["draft", "Draft", 1, 1, 0],
    ["submitted", "Submitted", 2, 0, 0],
    ["approved", "Approved", 3, 0, 0],
    ["audited", "Audited", 4, 0, 1],
  ];

  for (const [key, name, sortOrder, isInitial, isFinal] of steps) {
    await query(
      `INSERT INTO approval_hierarchy_steps (key, name, sort_order, is_initial, is_final, is_active)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT (key) DO UPDATE
         SET name = EXCLUDED.name,
             sort_order = EXCLUDED.sort_order,
             is_initial = EXCLUDED.is_initial,
             is_final = EXCLUDED.is_final,
             is_active = EXCLUDED.is_active`,
      [key, name, sortOrder, isInitial, isFinal],
    );
  }

  const transitions = [
    ["draft_to_submitted", "Draft to submit", "draft", "submitted"],
    ["submitted_to_draft", "Submit to draft", "submitted", "draft"],
    ["submitted_to_approved", "Submit to approve", "submitted", "approved"],
    ["approved_to_submitted", "Approve to submit", "approved", "submitted"],
    ["approved_to_audited", "Approve to audit", "approved", "audited"],
    ["audited_to_approved", "Audit to approve", "audited", "approved"],
  ];

  for (const [key, name, fromStepKey, toStepKey] of transitions) {
    await query(
      `INSERT INTO approval_hierarchy_transitions (key, name, from_step_key, to_step_key, is_active)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (key) DO UPDATE
         SET name = EXCLUDED.name,
             from_step_key = EXCLUDED.from_step_key,
             to_step_key = EXCLUDED.to_step_key,
             is_active = EXCLUDED.is_active`,
      [key, name, fromStepKey, toStepKey],
    );
  }

  await query(
    `INSERT INTO approval_hierarchy_groups (key, name, module_key, description, is_default, is_active)
     VALUES ($1, $2, $3, $4, 1, 1)
     ON CONFLICT (key) DO UPDATE
       SET name = EXCLUDED.name,
           module_key = EXCLUDED.module_key,
           description = EXCLUDED.description,
           is_default = EXCLUDED.is_default,
           is_active = EXCLUDED.is_active`,
    [
      "utilities_approval_flow",
      "Utilities approval flow",
      "utilities",
      "Default utilities month approval hierarchy.",
    ],
  );

  for (let index = 0; index < steps.length; index += 1) {
    await query(
      `INSERT INTO approval_hierarchy_group_steps (group_key, step_key, position_index)
       VALUES ($1, $2, $3)
       ON CONFLICT (group_key, step_key) DO UPDATE
         SET position_index = EXCLUDED.position_index`,
      ["utilities_approval_flow", steps[index][0], index + 1],
    );
  }

  await query(
    `DELETE FROM approval_hierarchy_group_steps
      WHERE group_key = $1
        AND step_key <> ALL($2::text[])`,
    ["utilities_approval_flow", steps.map(([key]) => key)],
  );

  for (let index = 0; index < transitions.length; index += 1) {
    await query(
      `INSERT INTO approval_hierarchy_group_transitions (group_key, transition_key, position_index)
       VALUES ($1, $2, $3)
       ON CONFLICT (group_key, transition_key) DO UPDATE
         SET position_index = EXCLUDED.position_index`,
      ["utilities_approval_flow", transitions[index][0], index + 1],
    );
  }

  await query(
    `DELETE FROM approval_hierarchy_group_transitions
      WHERE group_key = $1
        AND transition_key <> ALL($2::text[])`,
    ["utilities_approval_flow", transitions.map(([key]) => key)],
  );
  await query(
    `DELETE FROM approval_hierarchy_role_transitions
      WHERE group_key = $1
        AND transition_key <> ALL($2::text[])`,
    ["utilities_approval_flow", transitions.map(([key]) => key)],
  );
  await query(
    `DELETE FROM approval_hierarchy_user_transitions
      WHERE group_key = $1
        AND transition_key <> ALL($2::text[])`,
    ["utilities_approval_flow", transitions.map(([key]) => key)],
  );

  await query(
    `UPDATE utility_monthly_approvals
        SET approval_status = CASE
          WHEN approval_status IN ('pending', 'draft') THEN 'draft'
          WHEN approval_status IN ('submitted', 'checked', 'recommended') THEN 'submitted'
          WHEN approval_status = 'approved' THEN 'approved'
          WHEN approval_status = 'audited' THEN 'audited'
          ELSE approval_status
        END
      WHERE approval_status IN ('pending', 'draft', 'submitted', 'checked', 'recommended', 'approved', 'audited')`,
  );

  const adminRoleId = await getIdByName("roles", "Admin");
  if (adminRoleId) {
    for (const [transitionKey] of transitions) {
      await query(
        `INSERT INTO approval_hierarchy_role_transitions (group_key, role_id, transition_key)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_key, role_id, transition_key) DO NOTHING`,
        ["utilities_approval_flow", adminRoleId, transitionKey],
      );
    }
  }

  await seedUtilitiesRoleTransitions();
}

async function seedUtilitiesRolePermissions() {
  const rolePermissions = {
    "Utilities Preparer": [
      "companies:read",
      "utilities:read",
      "utilities:write",
      "utilities:update",
      "reports:read",
    ],
    "Utilities Approver": [
      "companies:read",
      "utilities:read",
      "reports:read",
    ],
    "Utilities Auditor": [
      "companies:read",
      "utilities:read",
      "reports:read",
      "reports:export",
    ],
  };

  for (const [roleName, permissionKeys] of Object.entries(rolePermissions)) {
    const roleId = await getIdByName("roles", roleName);
    if (!roleId) continue;
    await query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);
    for (const permissionKey of permissionKeys) {
      await query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE key = $2
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        [roleId, permissionKey],
      );
    }
  }
}

async function seedUtilitiesRoleTransitions() {
  const roleTransitions = {
    "Utilities Preparer": ["draft_to_submitted", "submitted_to_draft"],
    "Utilities Approver": ["submitted_to_approved", "approved_to_submitted"],
    "Utilities Auditor": ["approved_to_audited", "audited_to_approved"],
  };

  for (const [roleName, transitionKeys] of Object.entries(roleTransitions)) {
    const roleId = await getIdByName("roles", roleName);
    if (!roleId) continue;
    await query(
      `DELETE FROM approval_hierarchy_role_transitions
        WHERE group_key = $1 AND role_id = $2`,
      ["utilities_approval_flow", roleId],
    );
    for (const transitionKey of transitionKeys) {
      await query(
        `INSERT INTO approval_hierarchy_role_transitions (group_key, role_id, transition_key)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_key, role_id, transition_key) DO NOTHING`,
        ["utilities_approval_flow", roleId, transitionKey],
      );
    }
  }
}

async function seedEmployees() {
  for (const [employeeId, name, companyName, departmentName, designationName, isActive, email, phone] of defaultEmployees) {
    const companyId = await getIdByName("companies", companyName);
    const departmentId = await getIdByName("departments", departmentName);
    const designationId = await getIdByName("designations", designationName);
    await query(`INSERT INTO employees (employee_id, name, company_id, department_id, designation_id, is_active, email, phone, joined_on) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE) ON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, company_id = COALESCE(employees.company_id, EXCLUDED.company_id), department_id = COALESCE(employees.department_id, EXCLUDED.department_id), designation_id = COALESCE(employees.designation_id, EXCLUDED.designation_id), is_active = EXCLUDED.is_active, email = EXCLUDED.email, phone = EXCLUDED.phone`, [employeeId, name, companyId, departmentId, designationId, isActive, email, phone]);
  }
}

async function seedMeters() {
  for (const [companyName, utilityTypeKey, meterName, uomName, sourceName, code, location] of defaultMeters) {
    const companyId = await getIdByName("companies", companyName);
    const utilityTypeId = await getIdByKey("utility_types", utilityTypeKey);
    const uomId = await getIdByName("uom", uomName);
    const sourceId = sourceName ? await getIdByName("sources", sourceName) : null;

    await query(
      `INSERT INTO meters (name, code, location, company_id, utility_type_id, source_id, uom_id, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,1) ON CONFLICT (company_id, utility_type_id, name) DO NOTHING`,
      [meterName, code || null, location || null, companyId, utilityTypeId, sourceId, uomId],
    );
  }
}

async function seedReportDefinitions() {
  const utilitiesMasterSql = `
    SELECT
      c.name AS company,
      COALESCE(m.code, 'UTL-' || LPAD(m.id::text, 3, '0')) AS utility_id,
      ut.name AS utility_type,
      COALESCE(s.name, '-') AS source_type,
      COALESCE(s.name, '-') AS source_name,
      COALESCE(m.code, 'MTR-' || LPAD(m.id::text, 3, '0')) AS meter_id,
      m.name AS meter_name,
      COALESCE(m.location, '-') AS location,
      u.name AS unit,
      CASE WHEN ut.key IN ('electricity', 'steam') AND (LOWER(COALESCE(s.name, '')) LIKE '%generator%' OR LOWER(COALESCE(s.name, '')) LIKE '%boiler%') THEN 'Yes' ELSE 'No' END AS fuel_linked,
      CASE WHEN LOWER(COALESCE(s.name, '')) LIKE '%generator%' THEN 'Diesel' WHEN LOWER(COALESCE(s.name, '')) LIKE '%boiler%' THEN 'Gas' ELSE '' END AS fuel_type,
      CASE WHEN LOWER(COALESCE(s.name, '')) LIKE '%generator%' THEN 'Liter' WHEN LOWER(COALESCE(s.name, '')) LIKE '%boiler%' THEN 'm?' ELSE '' END AS fuel_unit,
      ''::text AS rate,
      'BDT'::text AS currency,
      ''::text AS remarks,
      CASE WHEN m.is_active = 1 THEN 'yes' ELSE 'no' END AS is_active,
      COALESCE(ce.name, cu.username) AS prepared_by,
      m.created_at AS prepared_at,
      COALESCE(ue.name, uu.username) AS updated_by,
      m.updated_at AS updated_at,
      m.company_id::text AS company_id
    FROM meters m
    JOIN companies c ON c.id = m.company_id
    JOIN utility_types ut ON ut.id = m.utility_type_id
    JOIN uom u ON u.id = m.uom_id
    LEFT JOIN sources s ON s.id = m.source_id
    LEFT JOIN users cu ON cu.id = m.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    LEFT JOIN users uu ON uu.id = m.updated_by_user_id
    LEFT JOIN employees ue ON ue.id = uu.employee_id
    WHERE m.company_id = {{companyDbId}}
    ORDER BY ut.key ASC, m.name ASC
  `.trim();

  const variables = JSON.stringify([
    { name: "companyId", label: "Company", type: "company", required: true },
  ]);

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "utilities_master_data",
      "Utility Master Register",
      "Master register of utility meters, sources, units, and operational setup for the selected company.",
      utilitiesMasterSql,
      variables,
    ],
  );

  const utilitiesRecordsSql = `
    SELECT
      ur.id::text AS record_id,
      c.name AS company,
      ur.type AS utility_type,
      ur.period_start AS period_start,
      ur.period_end AS period_end,
      ur.meter_name AS meter_name,
      s.name AS source_name,
      ur.previous_reading AS previous_reading,
      ur.current_reading AS current_reading,
      ur.value AS consumption,
      ur.uom AS uom,
      ur.baseline_value AS baseline_value,
      ur.variance AS variance,
      ur.variance_percent AS variance_percent,
      ur.variance_flag AS variance_flag,
      ur.status AS status,
      ur.remarks AS remarks,
      jsonb_array_length(COALESCE(ur.bill_files, '[]'::jsonb)) AS bill_files_count,
      COALESCE(ce.name, cu.username) AS prepared_by,
      ur.created_at AS prepared_at,
      COALESCE(ue.name, uu.username) AS updated_by,
      ur.updated_at AS updated_at
    FROM utility_records ur
    JOIN companies c ON c.id = ur.facility_id
    LEFT JOIN sources s ON s.id = ur.source_id
    LEFT JOIN users cu ON cu.id = ur.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    LEFT JOIN users uu ON uu.id = ur.updated_by_user_id
    LEFT JOIN employees ue ON ue.id = uu.employee_id
    WHERE ur.facility_id = {{companyDbId}}
      AND ur.period_start >= {{fromDate}}
      AND ur.period_end <= {{toDate}}
    ORDER BY ur.period_end DESC, ur.id DESC
  `.trim();

  const recordVariables = JSON.stringify([
    { name: "companyId", label: "Company", type: "company", required: true },
    { name: "fromDate", label: "From date", type: "date", required: true },
    { name: "toDate", label: "To date", type: "date", required: true },
  ]);

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "utilities_consumption_records",
      "Utility Consumption Log",
      "Detailed utility usage records for the selected company and date range.",
      utilitiesRecordsSql,
      recordVariables,
    ],
  );

  const approvedUtilitiesSql = `
    SELECT
      c.name AS company,
      COALESCE(m.code, uma.meter_key) AS utility_id,
      ut.name AS utility_type,
      COALESCE(sw.name, s.name, '-') AS source_type,
      COALESCE(s.name, '-') AS source_name,
      COALESCE(m.code, '-') AS meter_id,
      uma.meter_name AS meter_name,
      COALESCE(m.location, '-') AS location,
      COALESCE(uma.uom, u.name, '-') AS unit,
      TO_CHAR(uma.period_month, 'YYYY-MM') AS bill_month,
      uma.record_count AS entry_count,
      uma.covered_days AS covered_days,
      uma.month_days AS month_days,
      uma.total_value AS approved_total,
      uma.total_diesel_liters AS diesel_liters,
      COALESCE(ae.name, au.username) AS approved_by,
      uma.approved_at AS approved_at,
      uma.approval_status AS approval_status
    FROM utility_monthly_approvals uma
    JOIN companies c ON c.id = uma.facility_id
    LEFT JOIN meters m ON m.id = uma.meter_id
    LEFT JOIN utility_types ut ON ut.key = uma.type
    LEFT JOIN sources s ON s.id = uma.source_id
    LEFT JOIN source_wiring swr ON swr.source_id = s.id AND swr.utility_type_id = ut.id
    LEFT JOIN sources sw ON sw.id = swr.source_id
    LEFT JOIN uom u ON u.id = m.uom_id
    LEFT JOIN users au ON au.id = uma.approved_by_user_id
    LEFT JOIN employees ae ON ae.id = au.employee_id
    WHERE uma.facility_id = {{companyDbId}}
      AND uma.period_month >= {{fromMonth}}
      AND uma.period_month <= {{toMonth}}
      AND uma.approval_status IN ('approved', 'audited')
    ORDER BY uma.period_month DESC, ut.name ASC, uma.meter_name ASC
  `.trim();

  const monthVariables = JSON.stringify([
    { name: "companyId", label: "Company", type: "company", required: true },
    { name: "fromMonth", label: "From month", type: "month", required: true },
    { name: "toMonth", label: "To month", type: "month", required: true },
  ]);

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "utilities_approved_data_report",
      "Approved Utility Summary",
      "Approved and audited monthly utility totals with approver details for the selected company.",
      approvedUtilitiesSql,
      monthVariables,
    ],
  );

  const utilityNoiseSql = `
    SELECT
      c.name AS company,
      COALESCE(m.code, uma.meter_key) AS utility_id,
      ut.name AS utility_type,
      COALESCE(s.name, '-') AS source_name,
      COALESCE(m.code, '-') AS meter_id,
      uma.meter_name AS meter_name,
      COALESCE(m.location, '-') AS location,
      COALESCE(uma.uom, u.name, '-') AS unit,
      TO_CHAR(uma.period_month, 'YYYY-MM') AS bill_month,
      uma.record_count AS entry_count,
      uma.covered_days AS covered_days,
      uma.month_days AS month_days,
      uma.total_value AS current_total,
      uma.missing_days_count AS missing_days_count,
      CASE
        WHEN uma.missing_days_count > 0 THEN (
          SELECT string_agg(x.start || ' to ' || x."end", ', ')
          FROM jsonb_to_recordset(uma.missing_ranges) AS x(start text, "end" text)
        )
        ELSE '-'
      END AS missing_ranges,
      uma.approval_status AS approval_status,
      COALESCE(ue.name, uu.username) AS last_updated_by,
      uma.updated_at AS last_updated_at
    FROM utility_monthly_approvals uma
    JOIN companies c ON c.id = uma.facility_id
    LEFT JOIN meters m ON m.id = uma.meter_id
    LEFT JOIN utility_types ut ON ut.key = uma.type
    LEFT JOIN sources s ON s.id = uma.source_id
    LEFT JOIN uom u ON u.id = m.uom_id
    LEFT JOIN users uu ON uu.id = uma.updated_by_user_id
    LEFT JOIN employees ue ON ue.id = uu.employee_id
    WHERE uma.facility_id = {{companyDbId}}
      AND uma.period_month >= {{fromMonth}}
      AND uma.period_month <= {{toMonth}}
      AND uma.approval_status NOT IN ('approved', 'audited')
    ORDER BY uma.period_month DESC, ut.name ASC, uma.meter_name ASC
  `.trim();

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "utilities_noise_data_report",
      "Unapproved Utility Exceptions",
      "Draft and submitted monthly utility data, including missing-day gaps and submission exceptions.",
      utilityNoiseSql,
      monthVariables,
    ],
  );

  const chemicalsRegisterSql = `
    SELECT
      co.name AS company,
      c.name AS chemical_name,
      COALESCE(c.trade_name, '-') AS trade_name,
      c.supplier AS supplier,
      c.storage_area AS storage_area,
      c.stock_kg AS stock_kg,
      COALESCE(c.min_stock_kg, 0) AS minimum_stock_kg,
      COALESCE(c.expiry_date::text, '-') AS expiry_date,
      c.approval_status AS approval_status,
      COALESCE(sr.chemical_name, '-') AS linked_sds,
      COALESCE(c.linked_waste_stream, '-') AS linked_waste_stream,
      COALESCE(ce.name, cu.username) AS prepared_by,
      c.created_at AS prepared_at
    FROM chemicals c
    JOIN companies co ON co.id = c.facility_id
    LEFT JOIN sds_records sr ON sr.id = c.sds_id
    LEFT JOIN users cu ON cu.id = c.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    WHERE c.facility_id = {{companyDbId}}
    ORDER BY c.name ASC
  `.trim();

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "chemicals_register",
      "Chemical Register",
      "Company-wise chemical inventory with stock, SDS linkage, and storage details.",
      chemicalsRegisterSql,
      variables,
    ],
  );

  const sdsRegisterSql = `
    SELECT
      sr.id::text AS sds_id,
      sr.chemical_name AS chemical_name,
      sr.supplier AS supplier,
      sr.language AS language,
      sr.revision_date AS revision_date,
      sr.file_name AS file_name,
      sr.is_active AS is_active,
      COALESCE(ce.name, cu.username) AS prepared_by,
      sr.created_at AS prepared_at
    FROM sds_records sr
    LEFT JOIN users cu ON cu.id = sr.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    WHERE sr.revision_date >= {{fromDate}}
      AND sr.revision_date <= {{toDate}}
    ORDER BY sr.revision_date DESC, sr.chemical_name ASC
  `.trim();

  const sdsVariables = JSON.stringify([
    { name: "fromDate", label: "From date", type: "date", required: true },
    { name: "toDate", label: "To date", type: "date", required: true },
  ]);

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 0, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "sds_register",
      "SDS Register",
      "SDS master list with revision dates and document availability.",
      sdsRegisterSql,
      sdsVariables,
    ],
  );

  const wasteLogSql = `
    SELECT
      co.name AS company,
      wr.log_date AS log_date,
      wr.stream AS waste_stream,
      wr.waste_type AS waste_type,
      wr.qty_kg AS quantity_kg,
      wr.storage_location AS storage_location,
      COALESCE(wr.vendor, '-') AS vendor,
      wr.disposal_status AS disposal_status,
      COALESCE(wr.manifest_no, '-') AS manifest_no,
      COALESCE(wr.due_by::text, '-') AS due_by,
      COALESCE(wr.notes, '-') AS notes,
      COALESCE(ce.name, cu.username) AS prepared_by,
      wr.created_at AS prepared_at
    FROM waste_records wr
    JOIN companies co ON co.id = wr.facility_id
    LEFT JOIN users cu ON cu.id = wr.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    WHERE wr.facility_id = {{companyDbId}}
      AND wr.log_date >= {{fromDate}}
      AND wr.log_date <= {{toDate}}
    ORDER BY wr.log_date DESC, wr.id DESC
  `.trim();

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "waste_log",
      "Waste Log",
      "Waste generation, storage, and disposal records for the selected company and date range.",
      wasteLogSql,
      recordVariables,
    ],
  );

  const wastewaterLabSql = `
    SELECT
      co.name AS company,
      wlr.sample_date AS sample_date,
      wlr.sample_point AS sample_point,
      wlr.ph AS ph,
      wlr.cod AS cod,
      wlr.bod AS bod,
      wlr.tss AS tss,
      COALESCE(wlr.do_value, 0) AS do_value,
      COALESCE(wlr.lab_report_name, '-') AS lab_report_name,
      COALESCE(wlr.notes, '-') AS notes,
      COALESCE(ce.name, cu.username) AS prepared_by,
      wlr.created_at AS prepared_at
    FROM wastewater_lab_records wlr
    JOIN companies co ON co.id = wlr.facility_id
    LEFT JOIN users cu ON cu.id = wlr.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    WHERE wlr.facility_id = {{companyDbId}}
      AND wlr.sample_date >= {{fromDate}}
      AND wlr.sample_date <= {{toDate}}
    ORDER BY wlr.sample_date DESC, wlr.id DESC
  `.trim();

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "wastewater_lab_log",
      "Wastewater Lab Log",
      "Wastewater and ETP sample results for the selected company and date range.",
      wastewaterLabSql,
      recordVariables,
    ],
  );

  const auditsLogSql = `
    SELECT
      co.name AS company,
      ar.name AS audit_name,
      COALESCE(ar.customer_name, '-') AS customer_name,
      ar.audit_date AS audit_date,
      COALESCE(ar.next_audit_date::text, '-') AS next_audit_date,
      ar.auditor AS auditor,
      ar.template_id AS template_id,
      ar.progress AS progress,
      ar.overall_score AS overall_score,
      COALESCE((ar.findings_count->>'minor')::int, 0) AS minor_findings,
      COALESCE((ar.findings_count->>'major')::int, 0) AS major_findings,
      COALESCE((ar.findings_count->>'critical')::int, 0) AS critical_findings,
      ar.created_at AS created_at
    FROM audit_records ar
    JOIN companies co ON co.id = ar.facility_id
    WHERE ar.facility_id = {{companyDbId}}
      AND ar.audit_date >= {{fromDate}}
      AND ar.audit_date <= {{toDate}}
    ORDER BY ar.audit_date DESC, ar.id DESC
  `.trim();

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "audits_log",
      "Audit Log",
      "Audit schedule, score, and findings summary for the selected company and date range.",
      auditsLogSql,
      recordVariables,
    ],
  );

  const documentsRegisterSql = `
    SELECT
      co.name AS company,
      dr.title AS title,
      dr.category AS category,
      dr.owner_department AS owner_department,
      COALESCE(dr.expires_on::text, '-') AS expires_on,
      dr.status AS status,
      dr.file_name AS file_name,
      COALESCE(dr.notes, '-') AS notes,
      COALESCE(ce.name, cu.username) AS prepared_by,
      dr.created_at AS created_at
    FROM document_records dr
    JOIN companies co ON co.id = dr.facility_id
    LEFT JOIN users cu ON cu.id = dr.created_by_user_id
    LEFT JOIN employees ce ON ce.id = cu.employee_id
    WHERE dr.facility_id = {{companyDbId}}
      AND dr.created_at::date >= {{fromDate}}
      AND dr.created_at::date <= {{toDate}}
    ORDER BY dr.created_at DESC, dr.id DESC
  `.trim();

  await query(
    `
      INSERT INTO report_definitions (key, name, description, requires_company, sql_text, variables, is_active)
      VALUES ($1, $2, $3, 1, $4, $5::jsonb, 1)
      ON CONFLICT (key) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            requires_company = EXCLUDED.requires_company,
            sql_text = EXCLUDED.sql_text,
            variables = EXCLUDED.variables,
            is_active = EXCLUDED.is_active
    `,
    [
      "documents_register",
      "Document Register",
      "Company-wise document register with expiry and ownership details.",
      documentsRegisterSql,
      recordVariables,
    ],
  );

  await query(
    `
      INSERT INTO email_notification_settings
        (key, is_active, smtp_port, smtp_secure, recipient_emails, from_name, from_email, subject_template, html_template)
      VALUES
        ($1, 0, 465, 1, '[]'::jsonb, $2, $3, $4, $5)
      ON CONFLICT (key) DO NOTHING
    `,
    [
      "utility_approval_submission",
      "EMS",
      "",
      "Utility approval required: {{companyName}} {{utilityType}} {{billMonth}}",
      "<!doctype html><html><body style=\"margin:0;padding:24px;background:#f5f7fb;font-family:Arial,sans-serif;color:#0f172a;\"><div style=\"max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;\"><div style=\"padding:20px 24px;background:#0f172a;color:#ffffff;\"><div style=\"font-size:18px;font-weight:700;\">EMS</div><div style=\"font-size:13px;opacity:0.8;margin-top:4px;\">Utility approval request</div></div><div style=\"padding:24px;\"><h2 style=\"margin:0 0 12px;font-size:20px;\">Utility data submitted for approval</h2><table style=\"width:100%;border-collapse:collapse;font-size:14px;\"><tr><td style=\"padding:8px 0;color:#64748b;\">Company</td><td style=\"padding:8px 0;font-weight:600;\">{{companyName}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Utility type</td><td style=\"padding:8px 0;\">{{utilityType}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Meter</td><td style=\"padding:8px 0;\">{{meterName}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Bill month</td><td style=\"padding:8px 0;\">{{billMonth}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Entry count</td><td style=\"padding:8px 0;\">{{recordCount}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Total</td><td style=\"padding:8px 0;\">{{totalValue}} {{unit}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Submitted by</td><td style=\"padding:8px 0;\">{{submittedBy}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Submitted at</td><td style=\"padding:8px 0;\">{{submittedAt}}</td></tr></table></div></div></body></html>",
    ],
  );
}

async function seedUtilityConversionRules() {
  // Global default: approximate generator output from diesel consumption.
  // kWh = liters * value (kWh/L)
  await query(
    `
      INSERT INTO utility_conversion_rules (company_id, key, value, is_active)
      VALUES (NULL, $1, $2, 1)
      ON CONFLICT (company_id, key) DO NOTHING
    `,
    ["generator_diesel_kwh_per_liter", 3.5],
  );
}

async function seedEmailNotificationSettings() {
  await query(
    `
      INSERT INTO email_notification_settings
        (key, is_active, smtp_port, smtp_secure, recipient_emails, from_name, from_email, subject_template, html_template)
      VALUES
        ($1, 0, 465, 1, '[]'::jsonb, $2, $3, $4, $5)
      ON CONFLICT (key) DO NOTHING
    `,
    [
      "login_log",
      "EMS",
      "",
      "Login alert: {{userName}}",
      "<!doctype html><html><body style=\"margin:0;padding:24px;background:#f5f7fb;font-family:Arial,sans-serif;color:#0f172a;\"><div style=\"max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;\"><div style=\"padding:20px 24px;background:#0f172a;color:#ffffff;\"><div style=\"font-size:18px;font-weight:700;\">EMS</div><div style=\"font-size:13px;opacity:0.8;margin-top:4px;\">Login notification</div></div><div style=\"padding:24px;\"><h2 style=\"margin:0 0 12px;font-size:20px;\">New sign-in detected</h2><p style=\"margin:0 0 16px;font-size:14px;line-height:1.6;\">A user has signed in to <strong>{{appName}}</strong>.</p><table style=\"width:100%;border-collapse:collapse;font-size:14px;\"><tr><td style=\"padding:8px 0;color:#64748b;\">Name</td><td style=\"padding:8px 0;font-weight:600;\">{{userName}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Username</td><td style=\"padding:8px 0;\">{{username}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Employee ID</td><td style=\"padding:8px 0;\">{{employeeId}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Email</td><td style=\"padding:8px 0;\">{{userEmail}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Login time</td><td style=\"padding:8px 0;\">{{loginAt}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">IP address</td><td style=\"padding:8px 0;\">{{ipAddress}}</td></tr></table></div></div></body></html>",
    ],
  );
}
