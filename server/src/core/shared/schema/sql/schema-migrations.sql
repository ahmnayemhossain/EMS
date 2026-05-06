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
