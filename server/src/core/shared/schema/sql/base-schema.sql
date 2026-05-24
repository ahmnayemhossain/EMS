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

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  template_key TEXT NOT NULL,
  description TEXT,
  default_span INTEGER NOT NULL DEFAULT 6 CHECK (default_span BETWEEN 1 AND 6),
  default_rows INTEGER NOT NULL DEFAULT 3 CHECK (default_rows BETWEEN 1 AND 12),
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT,
  updated_by_user_id BIGINT,
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
  code TEXT,
  location TEXT,
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

CREATE TABLE IF NOT EXISTS utility_conversion_rules (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
  key TEXT NOT NULL,
  value NUMERIC NOT NULL,
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, key)
);

CREATE TABLE IF NOT EXISTS capa_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  owner_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'pending_verification', 'closed', 'overdue')),
  due_date DATE NOT NULL,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  related_finding_id TEXT,
  position_index INTEGER NOT NULL DEFAULT 0,
  is_dismissed SMALLINT NOT NULL DEFAULT 0 CHECK (is_dismissed IN (0, 1)),
  dismissed_at TIMESTAMPTZ,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_definitions (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requires_company SMALLINT NOT NULL DEFAULT 1 CHECK (requires_company IN (0, 1)),
  sql_text TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_notification_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  is_active SMALLINT NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_secure SMALLINT NOT NULL DEFAULT 1 CHECK (smtp_secure IN (0, 1)),
  smtp_username TEXT,
  smtp_password TEXT,
  from_name TEXT,
  from_email TEXT,
  recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  subject_template TEXT NOT NULL DEFAULT 'Login alert: {{userName}}',
  html_template TEXT NOT NULL DEFAULT '<!doctype html><html><body><h2>Login alert</h2><p><strong>{{userName}}</strong> signed in to {{appName}}.</p><p>Username: {{username}}</p><p>Employee ID: {{employeeId}}</p><p>Email: {{userEmail}}</p><p>Time: {{loginAt}}</p><p>IP: {{ipAddress}}</p></body></html>',
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_steps (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_initial SMALLINT NOT NULL DEFAULT 0 CHECK (is_initial IN (0, 1)),
  is_final SMALLINT NOT NULL DEFAULT 0 CHECK (is_final IN (0, 1)),
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_transitions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  from_step_key TEXT NOT NULL REFERENCES approval_hierarchy_steps(key) ON UPDATE CASCADE ON DELETE CASCADE,
  to_step_key TEXT NOT NULL REFERENCES approval_hierarchy_steps(key) ON UPDATE CASCADE ON DELETE CASCADE,
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_groups (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  module_key TEXT NOT NULL,
  description TEXT,
  is_default SMALLINT NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_group_steps (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  step_key TEXT NOT NULL REFERENCES approval_hierarchy_steps(key) ON UPDATE CASCADE ON DELETE CASCADE,
  position_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, step_key)
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_group_transitions (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  transition_key TEXT NOT NULL REFERENCES approval_hierarchy_transitions(key) ON UPDATE CASCADE ON DELETE CASCADE,
  position_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, transition_key)
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_role_transitions (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
  transition_key TEXT NOT NULL REFERENCES approval_hierarchy_transitions(key) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, role_id, transition_key)
);

CREATE TABLE IF NOT EXISTS approval_hierarchy_user_transitions (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  transition_key TEXT NOT NULL REFERENCES approval_hierarchy_transitions(key) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, user_id, transition_key)
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

CREATE TABLE IF NOT EXISTS utility_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  type TEXT NOT NULL,
  meter_id BIGINT REFERENCES meters(id) ON UPDATE CASCADE ON DELETE SET NULL,
  meter_key TEXT NOT NULL,
  source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_month DATE NOT NULL,
  meter_name TEXT NOT NULL,
  diesel_liters NUMERIC,
  calc_method TEXT,
  calc_factor NUMERIC,
  previous_reading NUMERIC,
  current_reading NUMERIC,
  uom TEXT NOT NULL,
  value NUMERIC NOT NULL,
  baseline_value NUMERIC,
  min_threshold NUMERIC,
  max_threshold NUMERIC,
  variance NUMERIC,
  variance_percent NUMERIC,
  variance_flag TEXT,
  status TEXT,
  remarks TEXT,
  bill_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utility_monthly_approvals (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
  type TEXT NOT NULL,
  meter_id BIGINT REFERENCES meters(id) ON UPDATE CASCADE ON DELETE SET NULL,
  meter_key TEXT NOT NULL,
  meter_name TEXT NOT NULL,
  source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL,
  period_month DATE NOT NULL,
  coverage_start DATE,
  coverage_end DATE,
  covered_days INTEGER NOT NULL DEFAULT 0,
  month_days INTEGER NOT NULL DEFAULT 0,
  missing_ranges JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_days_count INTEGER NOT NULL DEFAULT 0,
  record_count INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC NOT NULL DEFAULT 0,
  total_diesel_liters NUMERIC,
  uom TEXT,
  approval_status TEXT NOT NULL DEFAULT 'draft',
  approved_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_id, type, meter_key, period_month)
);

ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS meter_id BIGINT REFERENCES meters(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS meter_key TEXT;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS period_month DATE;
UPDATE utility_records
SET meter_key = CASE
  WHEN meter_id IS NOT NULL THEN 'meter:' || meter_id::text
  ELSE 'name:' || lower(trim(meter_name))
END
WHERE meter_key IS NULL OR meter_key = '';
UPDATE utility_records
SET period_month = date_trunc('month', period_start)::date
WHERE period_month IS NULL;

CREATE TABLE IF NOT EXISTS sds_records (
  id BIGSERIAL PRIMARY KEY,
  chemical_name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  language TEXT NOT NULL,
  revision_date DATE NOT NULL,
  file_name TEXT,
  notes TEXT,
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sds_sections (
  id BIGSERIAL PRIMARY KEY,
  sds_id BIGINT NOT NULL REFERENCES sds_records(id) ON UPDATE CASCADE ON DELETE CASCADE,
  section_no SMALLINT NOT NULL CHECK (section_no BETWEEN 1 AND 16),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  UNIQUE (sds_id, section_no)
);

CREATE TABLE IF NOT EXISTS chemicals (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name TEXT NOT NULL,
  trade_name TEXT,
  supplier TEXT NOT NULL DEFAULT '',
  storage_area TEXT NOT NULL,
  hazard_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  stock_kg NUMERIC NOT NULL DEFAULT 0,
  min_stock_kg NUMERIC,
  expiry_date DATE,
  sds_id BIGINT REFERENCES sds_records(id) ON UPDATE CASCADE ON DELETE SET NULL,
  ppe JSONB NOT NULL DEFAULT '[]'::jsonb,
  storage_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  compatibility_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_waste_stream TEXT,
  batches JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_row ON audit_logs(table_name, row_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_utility_conversion_rules_key ON utility_conversion_rules(key);
CREATE INDEX IF NOT EXISTS idx_capa_records_facility_status_position ON capa_records(facility_id, status, position_index);
CREATE INDEX IF NOT EXISTS idx_capa_records_due_date ON capa_records(due_date);
CREATE INDEX IF NOT EXISTS idx_report_definitions_active ON report_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_report_definitions_key ON report_definitions(key);
CREATE INDEX IF NOT EXISTS idx_email_notification_settings_key ON email_notification_settings(key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_groups_module ON approval_hierarchy_groups(module_key, is_default, is_active);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_group_steps_group ON approval_hierarchy_group_steps(group_key, position_index);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_transitions_steps ON approval_hierarchy_transitions(from_step_key, to_step_key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_role_transitions_role ON approval_hierarchy_role_transitions(role_id, group_key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_user_transitions_user ON approval_hierarchy_user_transitions(user_id, group_key);
CREATE INDEX IF NOT EXISTS idx_file_assets_entity ON file_assets(module, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_company ON file_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_utility_records_type ON utility_records(type);
CREATE INDEX IF NOT EXISTS idx_utility_records_facility_id ON utility_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_utility_records_period_start ON utility_records(period_start);
CREATE INDEX IF NOT EXISTS idx_utility_records_month_key ON utility_records(facility_id, type, meter_key, period_month);
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approvals_company_month ON utility_monthly_approvals(facility_id, period_month);
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approvals_status ON utility_monthly_approvals(approval_status);
CREATE INDEX IF NOT EXISTS idx_sds_records_revision_date ON sds_records(revision_date);
CREATE INDEX IF NOT EXISTS idx_chemicals_facility_id ON chemicals(facility_id);
CREATE INDEX IF NOT EXISTS idx_chemicals_sds_id ON chemicals(sds_id);
