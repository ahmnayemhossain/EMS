# Frontend Maintenance Guide

## Purpose

This guide explains the current frontend architecture in practical terms so a developer can maintain the project without reverse-engineering feature behavior first.

## Top-level structure

- `client/src/components`
  - reusable UI only
  - no feature-specific API or business rules
- `client/src/core`
  - app shell, routes, shared state, app providers, shared data/types
- `client/src/features`
  - business modules grouped by navigation domain

## Navigation to folder mapping

- `overview`
  - audit calendar
- `operations`
  - utilities
  - chemicals
  - sds
  - waste
  - wastewater
- `assurance`
  - audits
  - capa
  - documents
  - reports
- `people`
  - complaint box
  - incidents
  - training
- `admin`
  - settings

## Settings module structure

Settings is split into:

- `modules/screens`
  - top-level settings screens such as users, companies, meters, reports, email
- `modules/services`
  - settings API files
- `modules/users`
  - user-specific UI/helpers
- `modules/companies`
  - company-specific UI/helpers
- `modules/employees`
  - employee-specific UI/helpers
- `modules/roles`
  - role-specific UI/helpers
- `modules/master-wiring`
  - reusable wiring flow for source/uom style admin relationships
- `modules/entity-manager`
  - reusable reference entity management
- `modules/api`
  - low-level system API helpers
- `modules/wiring-api`
  - low-level wiring API helpers

Rule:
- if a file is a reusable settings workflow, it should not live inside `screens`
- if a file is a screen entry that assembles other parts, it belongs in `screens`

## Utilities business rules

Utilities is one of the most rule-heavy features.

Important behavior:

- records are scoped by company and meter
- date ranges cannot overlap
- same-day duplicate entry is blocked
- one entry cannot cross more than one month
- partial month coverage is allowed
- full month coverage changes workflow state
- monthly flow:
  - `Missing`
  - `Ready to submit`
  - `Pending approval`
  - `Approved`
- approved and unapproved data are reported separately
- generator electricity supports:
  - meter reading flow
  - diesel consumption conversion flow
- diesel-to-kWh conversion is controlled from settings

When changing utilities:
- verify both create and edit
- verify overlap validation
- verify month submit/approve flow
- verify report output still matches approval state

## Reports business rules

Reports are definition-driven.

Important behavior:

- definitions come from backend/database
- report page is preview-first
- export should be based on validated preview/run payload
- company-bound reports require selected company
- variable-driven reports validate required values before execution

Current structure:

- `pages`
  - page entry
- `components`
  - preview dialog and cards
- `services`
  - API calls
- `utils`
  - payload building, validation, CSV helpers
- `types`
  - local page/report types

## Refactor rules

When adding or changing frontend code:

1. put shared UI in `components`
2. put shell/navigation/state wiring in `core`
3. put feature behavior in `features`
4. avoid reintroducing alias hacks to compensate for wrong imports
5. prefer direct real paths over compatibility shortcuts
6. if a feature grows, split it into:
   - `pages`
   - `components`
   - `hooks`
   - `services`
   - `utils`
   - `types`

## Performance rules

Current performance decisions:

- vendor bundles are split by dependency group
- chart code is isolated in a separate vendor chunk

If performance work continues:

1. keep heavy libs route-local where possible
2. lazy load feature pages instead of shell-level imports
3. isolate charts and other heavy UI helpers from generic routes

## Safe maintenance checklist

Before merging frontend changes:

1. run `npx tsc --noEmit` in `client`
2. run `npm run build` in `client`
3. click the changed route manually
4. test at least one related create/edit flow if form logic changed
5. confirm route imports still follow actual folder structure
