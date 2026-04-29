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
  source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  meter_name TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_row ON audit_logs(table_name, row_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_file_assets_entity ON file_assets(module, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_company ON file_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_utility_records_type ON utility_records(type);
CREATE INDEX IF NOT EXISTS idx_utility_records_facility_id ON utility_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_utility_records_period_start ON utility_records(period_start);
