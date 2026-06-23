-- EMS baseline Prisma migration.
-- This file replaces the old startup SQL bootstrap and becomes the source of truth for schema deploys.

-- === Legacy bootstrap: base schema ===
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

CREATE TABLE IF NOT EXISTS utility_monthly_approval_history (
  id BIGSERIAL PRIMARY KEY,
  monthly_approval_id BIGINT NOT NULL REFERENCES utility_monthly_approvals(id) ON UPDATE CASCADE ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  approval_status TEXT NOT NULL DEFAULT 'draft',
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

CREATE TABLE IF NOT EXISTS waste_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  log_date DATE NOT NULL,
  stream TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  qty_kg NUMERIC NOT NULL DEFAULT 0,
  storage_location TEXT NOT NULL,
  vendor TEXT,
  disposal_status TEXT NOT NULL DEFAULT 'stored',
  manifest_no TEXT,
  due_by DATE,
  notes TEXT,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wastewater_lab_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  sample_date DATE NOT NULL,
  sample_point TEXT NOT NULL,
  ph NUMERIC NOT NULL,
  cod NUMERIC NOT NULL,
  bod NUMERIC NOT NULL,
  tss NUMERIC NOT NULL,
  do_value NUMERIC,
  lab_report_name TEXT,
  notes TEXT,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  owner_department TEXT NOT NULL,
  expires_on DATE,
  status TEXT NOT NULL DEFAULT 'valid',
  file_name TEXT NOT NULL,
  notes TEXT,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name TEXT NOT NULL,
  customer_name TEXT,
  audit_date DATE NOT NULL,
  next_audit_date DATE,
  auditor TEXT NOT NULL,
  template_id TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0,
  findings_count JSONB NOT NULL DEFAULT '{"minor":0,"major":0,"critical":0}'::jsonb,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
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
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approval_history_monthly ON utility_monthly_approval_history(monthly_approval_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sds_records_revision_date ON sds_records(revision_date);
CREATE INDEX IF NOT EXISTS idx_chemicals_facility_id ON chemicals(facility_id);
CREATE INDEX IF NOT EXISTS idx_chemicals_sds_id ON chemicals(sds_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chemicals_name_unique ON chemicals (lower(trim(name)));
CREATE INDEX IF NOT EXISTS idx_waste_records_facility_date ON waste_records(facility_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_waste_records_status ON waste_records(disposal_status);
CREATE INDEX IF NOT EXISTS idx_wastewater_lab_records_facility_date ON wastewater_lab_records(facility_id, sample_date DESC);
CREATE INDEX IF NOT EXISTS idx_document_records_facility_date ON document_records(facility_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_records_status ON document_records(status);
CREATE INDEX IF NOT EXISTS idx_audit_records_facility_date ON audit_records(facility_id, audit_date DESC);

-- === Legacy bootstrap: schema migrations ===
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
    PERFORM setval(pg_get_serial_sequence('companies', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM companies), 1), COALESCE((SELECT last_value FROM companies_id_seq), 1)), true);
  END IF;

  IF to_regclass('public.facilities') IS NOT NULL THEN
    EXECUTE '
      INSERT INTO companies (id, name, short_name, is_active, created_at, updated_at)
      SELECT id, regexp_replace(name, ''Factory'', ''Company'', ''gi''), COALESCE(NULLIF(short_code, ''''), ''COM-'' || id::text), is_active, created_at, updated_at
      FROM facilities
      ON CONFLICT (id) DO NOTHING
    ';
    PERFORM setval(pg_get_serial_sequence('companies', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM companies), 1), COALESCE((SELECT last_value FROM companies_id_seq), 1)), true);
  END IF;
END $$;

ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL;
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
UPDATE companies SET name = regexp_replace(name, 'Factory', 'Company', 'gi'), local_name = CASE WHEN local_name IS NULL THEN NULL ELSE regexp_replace(local_name, 'ফ্যাক্টরি', 'কোম্পানি', 'gi') END WHERE name ~* 'Factory' OR COALESCE(local_name, '') LIKE '%ফ্যাক্টরি%';
UPDATE companies SET short_name = COALESCE(NULLIF(short_name, ''), 'COM-' || id::text) WHERE short_name IS NULL OR short_name = '';
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
DROP TABLE IF EXISTS dashboard_widgets CASCADE;
DELETE FROM role_permissions rp
USING permissions p
WHERE p.id = rp.permission_id
  AND (p.key LIKE 'dashboard:%' OR p.key LIKE 'settings:dashboard_widgets:%');
DELETE FROM permissions
WHERE key LIKE 'dashboard:%'
   OR key LIKE 'settings:dashboard_widgets:%';
ALTER TABLE uom DROP COLUMN IF EXISTS code;
ALTER TABLE uom ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
ALTER TABLE uom ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT;

DO $$
DECLARE uom_name_unique record;
BEGIN
  FOR uom_name_unique IN
    SELECT conname FROM pg_constraint WHERE conrelid = 'public.uom'::regclass AND contype = 'u'
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
ALTER TABLE meters ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE meters ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS meter_id BIGINT REFERENCES meters(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS meter_key TEXT;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS diesel_liters NUMERIC;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS calc_method TEXT;
ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS calc_factor NUMERIC;
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
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_id, type, meter_key, period_month)
);
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS meter_id BIGINT REFERENCES meters(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS meter_key TEXT;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS meter_name TEXT;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS period_month DATE;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS coverage_start DATE;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS coverage_end DATE;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS covered_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS month_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS missing_ranges JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS missing_days_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS record_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS total_value NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS total_diesel_liters NUMERIC;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS uom TEXT;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS approved_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_utility_records_month_key ON utility_records(facility_id, type, meter_key, period_month);
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approvals_company_month ON utility_monthly_approvals(facility_id, period_month);
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approvals_status ON utility_monthly_approvals(approval_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chemicals_name_unique ON chemicals (lower(trim(name)));

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
CREATE INDEX IF NOT EXISTS idx_utility_conversion_rules_key ON utility_conversion_rules(key);

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
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS evidence_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS related_finding_id TEXT;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS position_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS is_dismissed SMALLINT NOT NULL DEFAULT 0 CHECK (is_dismissed IN (0, 1));
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE capa_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_capa_records_facility_status_position ON capa_records(facility_id, status, position_index);
CREATE INDEX IF NOT EXISTS idx_capa_records_due_date ON capa_records(due_date);

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
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS is_active SMALLINT NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1));
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS smtp_port INTEGER;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS smtp_secure SMALLINT NOT NULL DEFAULT 1 CHECK (smtp_secure IN (0, 1));
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS smtp_username TEXT;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS smtp_password TEXT;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS from_email TEXT;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS subject_template TEXT NOT NULL DEFAULT 'Login alert: {{userName}}';
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS html_template TEXT NOT NULL DEFAULT '<!doctype html><html><body><h2>Login alert</h2><p><strong>{{userName}}</strong> signed in to {{appName}}.</p><p>Username: {{username}}</p><p>Employee ID: {{employeeId}}</p><p>Email: {{userEmail}}</p><p>Time: {{loginAt}}</p><p>IP: {{ipAddress}}</p></body></html>';
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE email_notification_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_email_notification_settings_key ON email_notification_settings(key);

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
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS is_initial SMALLINT NOT NULL DEFAULT 0 CHECK (is_initial IN (0, 1));
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS is_final SMALLINT NOT NULL DEFAULT 0 CHECK (is_final IN (0, 1));
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE approval_hierarchy_steps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS from_step_key TEXT REFERENCES approval_hierarchy_steps(key) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS to_step_key TEXT REFERENCES approval_hierarchy_steps(key) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE approval_hierarchy_transitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS module_key TEXT;
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS is_default SMALLINT NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1));
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE approval_hierarchy_groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS approval_hierarchy_group_steps (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  step_key TEXT NOT NULL REFERENCES approval_hierarchy_steps(key) ON UPDATE CASCADE ON DELETE CASCADE,
  position_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, step_key)
);

ALTER TABLE approval_hierarchy_group_steps ADD COLUMN IF NOT EXISTS position_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE approval_hierarchy_group_steps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS approval_hierarchy_group_transitions (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  transition_key TEXT NOT NULL REFERENCES approval_hierarchy_transitions(key) ON UPDATE CASCADE ON DELETE CASCADE,
  position_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, transition_key)
);
ALTER TABLE approval_hierarchy_group_transitions ADD COLUMN IF NOT EXISTS position_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE approval_hierarchy_group_transitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS approval_hierarchy_role_transitions (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
  transition_key TEXT NOT NULL REFERENCES approval_hierarchy_transitions(key) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, role_id, transition_key)
);
ALTER TABLE approval_hierarchy_role_transitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS approval_hierarchy_user_transitions (
  group_key TEXT NOT NULL REFERENCES approval_hierarchy_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  transition_key TEXT NOT NULL REFERENCES approval_hierarchy_transitions(key) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_key, user_id, transition_key)
);
ALTER TABLE approval_hierarchy_user_transitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE utility_monthly_approvals ALTER COLUMN approval_status SET DEFAULT 'draft';
UPDATE utility_monthly_approvals
SET approval_status = 'draft'
WHERE approval_status IS NULL OR approval_status = '' OR approval_status = 'pending';

CREATE TABLE IF NOT EXISTS utility_monthly_approval_history (
  id BIGSERIAL PRIMARY KEY,
  monthly_approval_id BIGINT NOT NULL REFERENCES utility_monthly_approvals(id) ON UPDATE CASCADE ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE utility_monthly_approval_history ADD COLUMN IF NOT EXISTS note TEXT;

CREATE INDEX IF NOT EXISTS idx_utility_monthly_approval_history_monthly ON utility_monthly_approval_history(monthly_approval_id, created_at);

CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_groups_module ON approval_hierarchy_groups(module_key, is_default, is_active);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_group_steps_group ON approval_hierarchy_group_steps(group_key, position_index);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_transitions_steps ON approval_hierarchy_transitions(from_step_key, to_step_key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_role_transitions_role ON approval_hierarchy_role_transitions(role_id, group_key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_user_transitions_user ON approval_hierarchy_user_transitions(user_id, group_key);

CREATE TABLE IF NOT EXISTS waste_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  log_date DATE NOT NULL,
  stream TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  qty_kg NUMERIC NOT NULL DEFAULT 0,
  storage_location TEXT NOT NULL,
  vendor TEXT,
  disposal_status TEXT NOT NULL DEFAULT 'stored',
  manifest_no TEXT,
  due_by DATE,
  notes TEXT,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wastewater_lab_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  sample_date DATE NOT NULL,
  sample_point TEXT NOT NULL,
  ph NUMERIC NOT NULL,
  cod NUMERIC NOT NULL,
  bod NUMERIC NOT NULL,
  tss NUMERIC NOT NULL,
  do_value NUMERIC,
  lab_report_name TEXT,
  notes TEXT,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_records_facility_date ON waste_records(facility_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_waste_records_status ON waste_records(disposal_status);
CREATE INDEX IF NOT EXISTS idx_wastewater_lab_records_facility_date ON wastewater_lab_records(facility_id, sample_date DESC);

CREATE TABLE IF NOT EXISTS document_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  owner_department TEXT NOT NULL,
  expires_on DATE,
  status TEXT NOT NULL DEFAULT 'valid',
  file_name TEXT NOT NULL,
  notes TEXT,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_records (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name TEXT NOT NULL,
  customer_name TEXT,
  audit_date DATE NOT NULL,
  next_audit_date DATE,
  auditor TEXT NOT NULL,
  template_id TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0,
  findings_count JSONB NOT NULL DEFAULT '{"minor":0,"major":0,"critical":0}'::jsonb,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_records_facility_date ON document_records(facility_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_records_status ON document_records(status);
CREATE INDEX IF NOT EXISTS idx_audit_records_facility_date ON audit_records(facility_id, audit_date DESC);

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
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'factory_id') THEN
    EXECUTE 'UPDATE employees SET company_id = factory_id WHERE company_id IS NULL AND factory_id IN (SELECT id FROM companies)';
  END IF;
  IF to_regclass('public.user_factories') IS NOT NULL THEN
    EXECUTE 'INSERT INTO user_companies (user_id, company_id) SELECT user_id, factory_id FROM user_factories WHERE factory_id IN (SELECT id FROM companies) ON CONFLICT (user_id, company_id) DO NOTHING';
  END IF;
END $$;

DO $$
DECLARE fk record;
BEGIN
  IF to_regclass('public.utility_records') IS NOT NULL THEN
    FOR fk IN
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'public.utility_records'::regclass
        AND contype = 'f'
        AND confrelid IN (COALESCE(to_regclass('public.factories'), 'public.companies'::regclass), 'public.companies'::regclass)
    LOOP
      EXECUTE format('ALTER TABLE utility_records DROP CONSTRAINT IF EXISTS %I', fk.conname);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.utility_records'::regclass AND conname = 'utility_records_facility_id_companies_fkey') THEN
      ALTER TABLE utility_records
        ADD CONSTRAINT utility_records_facility_id_companies_fkey
        FOREIGN KEY (facility_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;
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

-- === Legacy bootstrap: post-seed constraints ===
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_created_by_user_id_fkey') THEN
    ALTER TABLE companies ADD CONSTRAINT companies_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_updated_by_user_id_fkey') THEN
    ALTER TABLE companies ADD CONSTRAINT companies_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_created_by_user_id_fkey') THEN
    ALTER TABLE users ADD CONSTRAINT users_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_created_by_user_id_fkey') THEN
    ALTER TABLE roles ADD CONSTRAINT roles_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_updated_by_user_id_fkey') THEN
    ALTER TABLE roles ADD CONSTRAINT roles_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'departments_created_by_user_id_fkey') THEN
    ALTER TABLE departments ADD CONSTRAINT departments_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'departments_updated_by_user_id_fkey') THEN
    ALTER TABLE departments ADD CONSTRAINT departments_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'designations_created_by_user_id_fkey') THEN
    ALTER TABLE designations ADD CONSTRAINT designations_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'designations_updated_by_user_id_fkey') THEN
    ALTER TABLE designations ADD CONSTRAINT designations_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_updated_by_user_id_fkey') THEN
    ALTER TABLE users ADD CONSTRAINT users_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uom_created_by_user_id_fkey') THEN
    ALTER TABLE uom ADD CONSTRAINT uom_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uom_updated_by_user_id_fkey') THEN
    ALTER TABLE uom ADD CONSTRAINT uom_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uom_wiring_created_by_user_id_fkey') THEN
    ALTER TABLE uom_wiring ADD CONSTRAINT uom_wiring_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uom_wiring_updated_by_user_id_fkey') THEN
    ALTER TABLE uom_wiring ADD CONSTRAINT uom_wiring_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sources_created_by_user_id_fkey') THEN
    ALTER TABLE sources ADD CONSTRAINT sources_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sources_updated_by_user_id_fkey') THEN
    ALTER TABLE sources ADD CONSTRAINT sources_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'source_wiring_created_by_user_id_fkey') THEN
    ALTER TABLE source_wiring ADD CONSTRAINT source_wiring_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'source_wiring_updated_by_user_id_fkey') THEN
    ALTER TABLE source_wiring ADD CONSTRAINT source_wiring_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meters_created_by_user_id_fkey') THEN
    ALTER TABLE meters ADD CONSTRAINT meters_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meters_updated_by_user_id_fkey') THEN
    ALTER TABLE meters ADD CONSTRAINT meters_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_created_by_user_id_fkey') THEN
    ALTER TABLE suppliers ADD CONSTRAINT suppliers_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_updated_by_user_id_fkey') THEN
    ALTER TABLE suppliers ADD CONSTRAINT suppliers_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_created_by_user_id_fkey') THEN
    ALTER TABLE employees ADD CONSTRAINT employees_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_updated_by_user_id_fkey') THEN
    ALTER TABLE employees ADD CONSTRAINT employees_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'uom' AND column_name = 'utility_type'
  ) THEN
    INSERT INTO uom_wiring (uom_id, utility_type_id)
    SELECT DISTINCT u.id, ut.id
    FROM uom u
    JOIN utility_types ut ON ut.key = lower(u.utility_type)
    WHERE COALESCE(u.utility_type, '') <> ''
    ON CONFLICT (uom_id, utility_type_id) DO NOTHING;
  END IF;
END $$;

ALTER TABLE uom DROP COLUMN IF EXISTS utility_type;
