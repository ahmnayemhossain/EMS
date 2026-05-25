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
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS template_key TEXT;
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS default_span INTEGER NOT NULL DEFAULT 6;
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS default_rows INTEGER NOT NULL DEFAULT 3;
UPDATE dashboard_widgets SET template_key = COALESCE(NULLIF(template_key, ''), 'utility_overview');
ALTER TABLE dashboard_widgets ALTER COLUMN template_key SET NOT NULL;
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
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS approved_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE utility_monthly_approvals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_utility_records_month_key ON utility_records(facility_id, type, meter_key, period_month);
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approvals_company_month ON utility_monthly_approvals(facility_id, period_month);
CREATE INDEX IF NOT EXISTS idx_utility_monthly_approvals_status ON utility_monthly_approvals(approval_status);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utility_monthly_approval_history_monthly ON utility_monthly_approval_history(monthly_approval_id, created_at);

CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_groups_module ON approval_hierarchy_groups(module_key, is_default, is_active);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_group_steps_group ON approval_hierarchy_group_steps(group_key, position_index);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_transitions_steps ON approval_hierarchy_transitions(from_step_key, to_step_key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_role_transitions_role ON approval_hierarchy_role_transitions(role_id, group_key);
CREATE INDEX IF NOT EXISTS idx_approval_hierarchy_user_transitions_user ON approval_hierarchy_user_transitions(user_id, group_key);

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
