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
      CASE WHEN ut.key IN ('electricity', 'steam') AND LOWER(COALESCE(s.name, '')) IN ('generator', 'boiler') THEN 'Yes' ELSE 'No' END AS fuel_linked,
      CASE WHEN LOWER(COALESCE(s.name, '')) = 'generator' THEN 'Diesel' WHEN LOWER(COALESCE(s.name, '')) = 'boiler' THEN 'Gas' ELSE '' END AS fuel_type,
      CASE WHEN LOWER(COALESCE(s.name, '')) = 'generator' THEN 'Liter' WHEN LOWER(COALESCE(s.name, '')) = 'boiler' THEN 'm³' ELSE '' END AS fuel_unit,
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
      AND uma.approval_status = 'approved'
    ORDER BY uma.period_month DESC, ut.name ASC, uma.meter_name ASC
  `.trim();

  const monthVariables = JSON.stringify([
    { name: "companyId", label: "Company", type: "company", required: true },
    { name: "fromMonth", label: "From month", type: "date", required: true },
    { name: "toMonth", label: "To month", type: "date", required: true },
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
      "Approved monthly utility totals with approver details for the selected company.",
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
      AND uma.approval_status <> 'approved'
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
      "Pending Utility Exceptions",
      "Unapproved monthly utility data, including missing-day gaps and submission exceptions.",
      utilityNoiseSql,
      monthVariables,
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
      "Fortis Group EMS",
      "",
      "Utility approval required: {{companyName}} {{utilityType}} {{billMonth}}",
      "<!doctype html><html><body style=\"margin:0;padding:24px;background:#f5f7fb;font-family:Arial,sans-serif;color:#0f172a;\"><div style=\"max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;\"><div style=\"padding:20px 24px;background:#0f172a;color:#ffffff;\"><div style=\"font-size:18px;font-weight:700;\">Fortis Group EMS</div><div style=\"font-size:13px;opacity:0.8;margin-top:4px;\">Utility approval request</div></div><div style=\"padding:24px;\"><h2 style=\"margin:0 0 12px;font-size:20px;\">Utility data submitted for approval</h2><table style=\"width:100%;border-collapse:collapse;font-size:14px;\"><tr><td style=\"padding:8px 0;color:#64748b;\">Company</td><td style=\"padding:8px 0;font-weight:600;\">{{companyName}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Utility type</td><td style=\"padding:8px 0;\">{{utilityType}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Meter</td><td style=\"padding:8px 0;\">{{meterName}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Bill month</td><td style=\"padding:8px 0;\">{{billMonth}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Entry count</td><td style=\"padding:8px 0;\">{{recordCount}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Total</td><td style=\"padding:8px 0;\">{{totalValue}} {{unit}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Submitted by</td><td style=\"padding:8px 0;\">{{submittedBy}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Submitted at</td><td style=\"padding:8px 0;\">{{submittedAt}}</td></tr></table></div></div></body></html>",
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
      "Fortis Group EMS",
      "",
      "Login alert: {{userName}}",
      "<!doctype html><html><body style=\"margin:0;padding:24px;background:#f5f7fb;font-family:Arial,sans-serif;color:#0f172a;\"><div style=\"max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;\"><div style=\"padding:20px 24px;background:#0f172a;color:#ffffff;\"><div style=\"font-size:18px;font-weight:700;\">Fortis Group EMS</div><div style=\"font-size:13px;opacity:0.8;margin-top:4px;\">Login notification</div></div><div style=\"padding:24px;\"><h2 style=\"margin:0 0 12px;font-size:20px;\">New sign-in detected</h2><p style=\"margin:0 0 16px;font-size:14px;line-height:1.6;\">A user has signed in to <strong>{{appName}}</strong>.</p><table style=\"width:100%;border-collapse:collapse;font-size:14px;\"><tr><td style=\"padding:8px 0;color:#64748b;\">Name</td><td style=\"padding:8px 0;font-weight:600;\">{{userName}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Username</td><td style=\"padding:8px 0;\">{{username}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Employee ID</td><td style=\"padding:8px 0;\">{{employeeId}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Email</td><td style=\"padding:8px 0;\">{{userEmail}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">Login time</td><td style=\"padding:8px 0;\">{{loginAt}}</td></tr><tr><td style=\"padding:8px 0;color:#64748b;\">IP address</td><td style=\"padding:8px 0;\">{{ipAddress}}</td></tr></table></div></div></body></html>",
    ],
  );
}
