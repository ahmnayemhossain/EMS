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
