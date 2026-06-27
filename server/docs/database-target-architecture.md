# EMS database target architecture

## Goal

Build the database by **business entity first**, not by page or UI component.

That means:

- keep reusable master data in dedicated tables
- keep transactional module data in separate record tables
- keep workflow/approval generic, not utility-specific
- avoid table creation only because one page exists

## Naming rules

- use plural snake_case table names
- use singular Prisma model names
- keep login identity (`users`) separate from HR identity (`employees`)
- keep reusable masters separate from transactions

## Recommended baseline

### 1. Organization and access

These are the tables every EMS needs first:

1. `companies`
2. `departments`
3. `designations`
4. `employees`
5. `users`
6. `roles`
7. `permissions`
8. `user_roles`
9. `role_permissions`
10. `user_companies`

### 2. Common master data

These support multiple modules:

11. `suppliers`
12. `units_of_measure`
13. `file_assets`
14. `system_settings`
15. `notification_settings`

### 3. Operations masters

These describe reusable operational structures:

16. `utility_types`
17. `sources`
18. `meters`
19. `chemicals`
20. `safety_data_sheets`

### 4. Generic workflow engine

These replace module-specific approval clutter:

21. `workflow_definitions`
22. `workflow_steps`
23. `workflow_transitions`
24. `workflow_role_assignments`
25. `workflow_user_assignments`
26. `workflow_instances`
27. `workflow_events`

### 5. Module transactions

These hold the actual business records:

28. `utility_periods`
29. `utility_entries`
30. `waste_entries`
31. `wastewater_samples`
32. `audit_records`
33. `capa_records`
34. `document_records`

### 6. Platform audit

35. `audit_logs`

## Recommended total

- **lean baseline:** `30-32` tables
- **full but still clean:** `33-35` tables

For this project, `34-35` application tables is a good target.

The current schema is functional, but it is too split in the approval/config area.

## What should be removed or merged

### Remove utility-specific workflow tables

Do not keep workflow separate for each page unless legally required.

Replace:

- `utility_monthly_approvals`
- `utility_monthly_approval_history`

With:

- `workflow_instances`
- `workflow_events`

### Reduce approval hierarchy fragmentation

Current approval setup is over-modeled.

Replace the current many-table hierarchy with:

- `workflow_definitions`
- `workflow_steps`
- `workflow_transitions`
- `workflow_role_assignments`
- `workflow_user_assignments`

### Remove unnecessary wiring tables where possible

Avoid config tables that only compensate for unclear domain design.

Examples that should be challenged before keeping:

- `source_wiring`
- `uom_wiring`
- `utility_conversion_rules`

If the meter already belongs to one utility type, one source, and one unit, the meter itself can be the source of truth.

## Domain rules

### People and access

- one employee may exist without a login
- one user may exist as a system/admin account
- one user may hold multiple roles
- one user may access multiple companies

### Chemicals and SDS

- chemical name should be unique within a company
- one chemical can have multiple SDS revisions
- one SDS belongs to one chemical

### Utilities

- one utility period = one company + one meter + one month
- one utility period contains many utility entries
- workflow should sit on the period, not on every reading row
- generator entries may store both meter reading and diesel usage

### Workflow

- workflow should be generic across utilities, waste, wastewater, documents, audits, and capa
- role assignment should define normal actions
- user assignment should allow exception cases
- admin override should be recorded explicitly in workflow events

## Migration strategy

Since this is before first release, a reset is acceptable.

Recommended sequence:

1. freeze current schema as legacy reference
2. introduce the clean foundation schema
3. regenerate the baseline migration from empty
4. rewrite seed data against the new schema
5. migrate backend modules one domain at a time:
   - organization/access
   - utilities
   - chemicals + SDS
   - waste
   - wastewater
   - assurance

## Non-goals

Do not create tables:

- only for page tabs
- only for visual widgets
- only for transient filter state
- only for report formatting

Those belong in code, not in the database.
