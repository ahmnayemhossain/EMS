# EMS - Final Feature List

## Core Development Guidelines

### Database

- Main database name must be `ems`.
- All database primary keys must be numeric:
  - Use `BIGSERIAL PRIMARY KEY` for application tables.
  - Do not use text/string values as primary keys.
- Human-readable or app-facing identifiers must be stored as unique non-PK fields:
  - Use `code` for records such as facilities, users, roles, departments, designations, employees.
  - Use `key` for permission keys.
- Foreign keys must reference numeric primary keys.
- Existing frontend string identifiers may still be accepted by APIs, but the server must map them to numeric database IDs before saving.
- Legacy text-primary-key tables must not be dropped silently. Rename/archive them before creating corrected numeric-primary-key tables.

### User, Role & Employee Model

- User-related tables must be created before module tables that reference users.
- Required user-related tables:
  - `facilities`
  - `departments`
  - `designations`
  - `employees`
  - `users`
  - `roles`
  - `permissions`
  - `user_roles`
  - `role_permissions`
- Employee table requirements:
  - Numeric primary key: `id BIGSERIAL PRIMARY KEY`
  - Numeric employee number: `employee_id INTEGER UNIQUE NOT NULL`
  - Employee name
  - Department relation: `department_id -> departments.id`
  - Designation relation: `designation_id -> designations.id`
  - Active status as numeric `0/1`
  - Email address required and unique
  - Phone number optional

### Utilities

- Utilities must use the server API and database, not mock data.
- Utility records must relate to:
  - Numeric `facilities.id`
  - Numeric `users.id` for created/updated user tracking
- The API may accept frontend facility/user codes, but must store numeric FK values.
- Same factory + utility type + meter + overlapping date range must not be saved twice.
- Utility record IDs must be numeric.
- Baseline and threshold settings are not required during utility entry.

## 1. Dashboard

- Group-level overview
- Facility performance summary
- Compliance score
- Audit readiness score
- KPI cards:
  - Utilities
  - Waste
  - ETP
- Alerts:
  - CAPA overdue
  - ETP exceed
- Recent activities
- Audit calendar snapshot

## 2. Operations

### Utilities

- Utility data entry:
  - Electricity
  - Water
  - Fuel
  - Steam
- Monthly consumption tracking
- Baseline vs actual comparison
- Variance status:
  - Normal
  - Watch
  - High
- Cost tracking
- Trend charts
- Bill file upload

### Waste

- Waste generation entry
- Waste category:
  - Hazardous
  - Non-hazardous
- Quantity tracking
- Disposal method
- Vendor tracking
- Waste trends

### Wastewater / ETP

- Daily/periodic parameter entry
- Parameters:
  - pH
  - BOD
  - COD
  - TSS
  - Temperature
  - Other applicable parameters
- Limit comparison with automatic check
- Status:
  - Within
  - Exceed
- Sludge tracking
- Chemical dosing log
- Trend charts

### Chemicals

- Chemical inventory
- Stock tracking
- Risk classification
- Supplier info
- Storage location
- Approval status

### SDS / MSDS

- SDS upload and management
- 16-section structured data
- Version tracking
- Expiry/review tracking
- Link with chemical

## 3. Compliance

### Audits

- Audit planning and scheduling
- Audit types:
  - Internal
  - Buyer
  - Certification
- Audit records
- Findings management
- Evidence upload
- Audit status tracking

### CAPA

- Corrective action tracking
- Root cause entry
- Action plan
- Owner assignment
- Due date tracking
- Status:
  - Open
  - In Progress
  - Verification
  - Closed
- Effectiveness check

### Documents

- Document upload and storage
- License/permit tracking
- Expiry tracking
- Basic version control
- Linked to modules

## 4. People & Events

### Incidents

- Incident reporting
- Type:
  - Spill
  - Overflow
  - Other environmental/safety incident types
- Severity
- Investigation
- Root cause
- Link to CAPA

### Complaint Box

- Complaint submission:
  - Internal
  - Public
- Anonymous option
- Category and facility tagging
- Conversation thread
- Status tracking

Public route:

```txt
/rb/:code
```

### Training

- Training session records
- Topic/category
- Participant list
- Trainer
- Date and validity
- Training coverage tracking

## 5. Notifications

- Notification inbox
- Read/unread
- Priority tagging
- Click to open related record

Auto-triggered for:

- CAPA overdue
- Audit upcoming
- ETP exceed

## 6. Admin / Settings

- Users management
- Roles and permissions
- Employees
  - Create modal must collect complete employee information directly.
  - Employee ID must be numeric.
  - Department and designation must use related dropdown data.
  - Active status must be `0` or `1`.
  - Email is required.
  - Phone is optional.
- Factories
- Departments
- Designations
- Suppliers
- Units of measure
- Threshold settings
- Approval settings
- Email/notification settings

## Final Structure - Simple View

- Dashboard
- Operations
- Compliance
- People & Events
- Notifications
- Admin

## UI Interaction Guidelines

- Success, warning, and error feedback should use centered `react-hot-toast` cards.
- Success feedback should show a large checkmark icon.
- Destructive actions must use a centered confirmation dialog before deleting.
- Drawer detail views should expose primary record actions such as Edit and Delete when records are editable.
