# EMS Development Guidelines

## Core Rules

- The application must use the server API and PostgreSQL database for real module data.
- Do not use mock data for production UI pages that create, update, delete, or display business records.
- Frontend code may keep small UI-only state locally, but saved records must come from the database.
- Database tables must use numeric primary keys.
- Foreign keys must reference numeric primary keys only.
- Do not add `code` columns to database tables. Numeric primary keys are enough.

## Database

- Main PostgreSQL database name: `ems`.
- Use `BIGSERIAL PRIMARY KEY` for application table IDs.
- Use `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` on mutable tables.
- Use numeric `0/1` values for active/inactive fields where the UI expects numeric status.
- Do not add redundant text identifier columns when a clear business identifier already exists.
- Do not silently drop legacy tables during migrations. Archive or rename legacy tables when the schema shape changes.
- API responses must expose numeric database IDs for saved records and lookup options.

## Lookup Tables

Lookup tables must use numeric `id` values for relationships and dropdown values.

Current lookup examples:

- `facilities.id`
- `departments.id`
- `designations.id`
- `roles.id`
- `users.id`

Permission identifiers may use `permissions.key` because permissions are action strings, not table row codes.

## Employee Table

The employee table must not have a separate `code` column.

Required shape:

```sql
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  facility_id BIGINT REFERENCES facilities(id) ON UPDATE CASCADE ON DELETE SET NULL,
  department_id BIGINT REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL,
  designation_id BIGINT REFERENCES designations(id) ON UPDATE CASCADE ON DELETE SET NULL,
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  joined_on DATE,
  created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Meaning:

- `id` is the internal database primary key.
- `employee_id` is the company employee number.
- `employee_id` must be numeric and unique.
- Employee create/update UI must collect name, employee ID, factory, department, designation, active status, email, phone, and joined date where applicable.
- Employee UI must read and write through `/api/system/employees`.

## Users And Login Actor

- User rows must link to employees by numeric `users.employee_id -> employees.id`.
- Backend write APIs should resolve the current actor from request context, currently `x-user-id`.
- Created/updated actor fields must store numeric `users.id`, not usernames or text labels.

## Audit Logging

- Create, update, and delete actions for important business tables must write an audit log.
- Audit logs should record:
  - table name
  - row ID
  - action: `create`, `update`, or `delete`
  - actor user ID
  - previous data snapshot where applicable
  - new data snapshot where applicable
  - timestamp
- Data write and audit log insert should run in one transaction.
- Employee create/update/delete must write to `audit_logs`.

## API Design

- Frontend pages must call server APIs instead of directly importing seed/mock datasets for saved records.
- API endpoints should accept numeric IDs from the UI for relationships.
- Server code must validate numeric IDs before insert/update.
- API responses should include readable related fields when useful, such as department name or designation name.
- Delete endpoints must return `{ ok: true }` after successful deletion.
- API errors should return clear messages that the UI can show in toast feedback.

## Frontend Data Rules

- Employee Settings must load employee rows from the database.
- Employee Settings dropdowns must load facilities, departments, and designations from the database.
- Do not import `seedEmployees`, `seedDepartments`, `seedDesignations`, or `facilities` mock data into DB-backed settings modules.
- After create/update/delete, update UI state from the API response or reload from the API.
- Show loading and empty states for DB-backed tables.

## UI Interaction

- Use centered toast feedback for success, warning, and error states.
- Destructive actions must use a confirmation dialog before deleting.
- Detail drawers should expose Save and Delete actions when records are editable.
- Inputs must validate required fields before calling the API.
- Tables should remain usable on desktop and mobile.

## Current Main Areas

- Dashboard
- Operations
- Compliance
- People and Events
- Notifications
- Admin and Settings

## Admin And Settings

Admin modules should eventually be database-backed, not local-only.

Priority DB-backed modules:

- Employees
- Users
- Roles and permissions
- Facilities
- Departments
- Designations

Employees is the reference pattern for future settings modules.
