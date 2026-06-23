# EMS Project Maintenance Handbook

## Purpose

This document is the main maintenance guide for the EMS project.
It is written for a junior developer who needs to understand the system, run it safely, change it without breaking core flows, and maintain it over time.

Use this document as the first reference before changing code.

Related docs:

- `docs/ARCHITECTURE.md`
- `docs/UTILITIES_MODULE_GUIDE.md`

---

## 1. What This Project Is

EMS is a business application for factory and compliance operations.
It currently includes a reusable app shell and multiple business modules, with Utilities being one of the most production-oriented modules.

The system is split into:

- a React client
- an Express API server
- a PostgreSQL database
- filesystem-based file storage exposed as `/cdn`

This is a monorepo. Client and server live in the same repository and are developed together.

---

## 2. High-Level System Model

Think of the application in 4 layers:

1. `client/`
   - UI
   - local form state
   - route handling
   - API calls

2. `server/`
   - request handling
   - permission enforcement
   - validation
   - business rules
   - database access
   - file storage orchestration

3. `PostgreSQL`
   - business data
   - master data
   - user and permission data
   - report definitions
   - file metadata

4. `storage/cdn`
   - actual uploaded PDF files
   - served by the API as public file URLs

Rule:

- UI does not own business truth
- server owns business rules
- database owns structured records
- storage owns file binaries

---

## 3. Technology Stack

## 3.1 Client

Client path:

- `client/`

Main stack:

- React `18.3.1`
- TypeScript
- Vite `6.3.5`
- Tailwind CSS `4.1.12`
- React Router `7.13.0`
- Zustand for client state
- Radix UI primitives
- Lucide icons
- `react-hot-toast`
- `date-fns`
- `react-day-picker`
- Recharts
- MUI used in some areas

Client purpose:

- render pages
- manage local UI state
- collect form input
- call backend APIs
- show file previews and reports

## 3.2 Server

Server path:

- `server/`

Main stack:

- Node.js
- Express `4.22.1`
- `pg` for PostgreSQL
- `zod` for validation
- `cors`
- `express-rate-limit`

Server purpose:

- authenticate user requests
- enforce permissions
- validate business rules
- read and write database records
- save and serve files
- trigger system emails

## 3.3 Database

Database:

- PostgreSQL

Used for:

- users
- companies
- permissions
- module records
- report definitions
- settings
- utility records
- monthly utility approval state
- file metadata

## 3.4 File Storage

Storage is filesystem-based right now.

Important rule:

- files are not stored inside the database
- only file metadata is stored in database tables

Actual files are stored in:

- local development fallback: `EMS/storage/cdn`
- production: `UPLOADS_DIR/cdn`

## 3.5 Tooling

Root scripts:

- `npm run dev`
- `npm run dev:client`
- `npm run dev:server`
- `npm run build`

Client dev:

- `npm --prefix client run dev`

Server dev:

- `npm --prefix server run dev`

---

## 4. Repository Structure

Main folders:

- `client/` - frontend application
- `server/` - backend API
- `docs/` - documentation
- `guidelines/` - project guidance
- `scripts/` - helper scripts
- `storage/` - local upload fallback root

### 4.1 Client Structure

Important folders:

- `client/src/core/`
- `client/src/features/`

`core` contains platform-level code:

- app bootstrap
- layouts
- auth/session
- shared UI
- settings
- reports page
- route registries
- themes
- API helpers

`features` contains business modules:

- utilities
- inbox
- chemicals
- audits
- waste
- incidents
- other business pages

Rule:

- reusable platform logic goes in `core`
- business-specific logic goes in `features`

### 4.2 Server Structure

Important folders:

- `server/src/core/`
- `server/src/features/`

`core` contains:

- shared schema setup
- auth routes
- settings infrastructure
- shared helpers
- storage helpers
- email helpers

`features` contains:

- business routes
- business modules
- record validation
- module-specific logic

Rule:

- shared runtime and platform behavior belongs in `core`
- module behavior belongs in `features`

---

## 5. How Requests Flow Through the System

Example: create a utility record with a PDF bill.

1. User opens Utilities create dialog in client
2. Client collects structured form data
3. Client sends record JSON to `/api/utilities`
4. Server validates:
   - company access
   - meter selection
   - date range
   - overlap rules
   - business calculation rules
5. Server saves the utility record in DB
6. If a PDF is attached, client uploads the file after record creation
7. Server stores the file under `storage/cdn/...`
8. Server writes file metadata to DB
9. Client refreshes the row and shows attachment info

Rule:

- create the business record first
- upload file second
- never trust client-calculated values when server can calculate them safely

---

## 6. Environment Configuration

Main example file:

- `server/.env.example`

Important variables:

- `PORT`
- `HOST`
- `CORS_ORIGIN`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `SEED_DEFAULTS`
- `REPORT_QUERY_TIMEOUT_MS`
- `UPLOADS_DIR`
- `CDN_PUBLIC_BASE`

### 6.1 Development Behavior

If `UPLOADS_DIR` is not set:

- uploads go to `EMS/storage/cdn`

That is intentional.
It keeps local development simple.

### 6.2 Production Behavior

In production, set:

- `UPLOADS_DIR`

Example:

- Windows: `C:\\ems-data\\uploads`
- Linux: `/var/ems/uploads`

Rule:

- production uploads must live outside the app release folder
- do not store uploaded files inside `client/`, `server/`, or build output folders

### 6.3 Migration and Seed Flags

Prisma migrations now control schema setup.

Relevant variables:

- `SEED_DEFAULTS`

Recommended:

- run `npm run db:setup` for a fresh database
- run `npm run prisma:migrate:baseline` once for an existing pre-Prisma database
- keep `SEED_DEFAULTS=true` only if you want idempotent default data sync on API boot

The API now checks `_prisma_migrations` on startup and fails fast when baseline or deploy steps are missing.

---

## 7. Storage and CDN Architecture

Storage helper:

- `server/src/core/shared/storage.js`

Current resolution order:

1. `UPLOADS_DIR`
2. `STORAGE_ROOT` legacy fallback
3. local fallback: `EMS/storage`

Public URL base:

- `/cdn`

The server exposes files through Express.

### 7.1 Why This Matters

This separation makes deployments safer.

If you redeploy application code:

- code can change
- uploaded files stay intact

If you store uploads inside the release folder:

- redeploy can destroy files

### 7.2 Utilities Bill File Layout

Utilities bills are stored by company short name, utility type, and month.

Current pattern:

```text
storage/cdn/utilities/<company-short-name>/<utility-type>/<year>/<month>/<generated-file>.pdf
```

Example:

```text
storage/cdn/utilities/fgl/electricity/2026/05/utilities_electricity_145_20260509_ab12cd34.pdf
```

Resolution priority for company folder:

1. `companies.short_name`
2. sanitized company name
3. `company-<id>`

Rule:

- short names should stay stable
- do not rename short names casually in production
- path changes only affect new uploads, not old ones

---

## 8. Database Design Principles

Current project design follows these rules:

- keep transactional records in database tables
- keep lookup values in master tables
- keep file binaries out of database
- store file metadata in DB
- use IDs for stable relations

Examples:

- utility records belong in `utility_records`
- monthly utility workflow state belongs in `utility_monthly_approvals`
- report definitions belong in `report_definitions`
- uploaded file metadata belongs in `file_assets`

### 8.1 Do Not Create a New Table for Every Report

This is important.

Ideal pattern:

- keep report definitions in a report metadata table
- run reports against existing business tables
- create special summary or materialized tables only for very heavy reports

That is why this project uses report definitions instead of one table per report.

### 8.2 Schema Change Rules

Before changing schema:

1. understand which route or module uses the table
2. check seed logic
3. check whether startup schema sync depends on create order
4. keep foreign keys in valid create order
5. do not remove columns without checking all client and server references

Past issue example:

- a table referenced `users(id)` before `users` existed in schema order
- that caused startup failure

Rule:

- schema order matters

---

## 9. Frontend Architecture Rules

## 9.1 Route Registry Pattern

Client routes are registry-driven.

Important files:

- `client/src/core/routes/app-route-registry.tsx`
- `client/src/core/routes/public-route-registry.ts`
- `client/src/core/settings/settings-route-registry.tsx`

This pattern drives:

- lazy routes
- sidebar items
- settings launcher cards
- labels and navigation structure

Rule:

- do not hardcode navigation in many places
- add routes through registries

## 9.2 Page Composition Pattern

A good feature page should look like this:

- page container
- smaller presentational sections
- thin API file
- small dialog components
- shared form helpers where useful

Good example:

- `client/src/features/UtilitiesPage/`

Avoid:

- giant one-file pages that own all state, layout, validation, API calls, and business logic together

## 9.3 Client Validation Rule

Client validation is for UX.
Server validation is for truth.

That means:

- client should guide the user
- server must still reject invalid requests

Never assume a client-side restriction is enough.

---

## 10. Backend Architecture Rules

## 10.1 Route Responsibility

Routes should stay thin.

Route files should do:

- parse input
- call permission checks
- orchestrate module functions
- return response

Route files should not become large business-rule files.

Move business logic into modules under:

- `server/src/features/modules/`

## 10.2 Shared Helpers

Keep cross-cutting logic in `server/src/core/shared/`:

- storage helpers
- smtp helpers
- postgres pool
- schema setup
- email settings helpers

## 10.3 Permission Rule

Every business action that matters should be permission-aware.

Examples:

- create utility record
- submit monthly utility pack
- approve monthly utility pack
- manage report definitions
- manage email settings

When adding a new action:

1. define permission key
2. wire it into server checks
3. expose it in UI only where allowed

---

## 11. Utilities Module Deep Dive

Utilities is the best reference module right now.
Study this module before building another production-oriented module.

Key client area:

- `client/src/features/UtilitiesPage/`

Key server area:

- `server/src/features/routes/utilities.js`
- `server/src/features/modules/utilities/`

### 11.1 Utilities Business Model

Utilities records support multiple utility types such as:

- electricity
- water
- fuel
- steam
- refrigerant
- other

The client no longer treats all types as free-form records.
The form is controlled by meter master data and utility-specific rules.

### 11.2 Meter-Centric Design

Important current rule:

- user must select a configured meter
- free-text meter name is not allowed

Why:

- prevents duplicate pseudo-meters
- keeps master data clean
- lets source and unit come from known configuration

Current behavior:

- `meterId` is required
- meter dropdown is disabled if no meter exists for the chosen utility type
- source and unit are auto-filled from meter data

### 11.3 Generator Electricity Logic

Generator electricity has a special rule.

It supports 2 calculation paths:

- meter reading path
- diesel consumption path

Only one path can be used at a time.
If one is provided, the other is locked.

The diesel-to-kWh conversion factor comes from settings.

Rule:

- server recalculates important values
- client must not be the final source of truth

### 11.4 Monthly Coverage Logic

This is one of the most important parts of the module.

Users can enter data in parts within a month.
Example:

- `2026-01-01` to `2026-01-05`
- `2026-01-06` to `2026-01-31`

That is valid if there is no overlap and the month becomes complete.

Invalid examples:

- overlapping dates
- same-day duplicate entries
- one record spanning more than one month
- entering `2026-01-10` to `2026-01-31` after `2026-01-01` to `2026-01-10`

Why invalid:

- day `10` overlaps

Valid correction:

- `2026-01-11` to `2026-01-31`

### 11.5 Monthly Status Model

Utilities rows now reflect workflow state instead of only a generic approval label.

Typical states:

- missing
- in progress
- ready to submit
- pending approval
- approved

The list also shows missing date ranges where relevant.

### 11.6 Submit and Approve Workflow

When a month becomes fully covered:

- it becomes ready to submit

After submit:

- it becomes pending approval

After approval:

- it becomes approved

Important permission separation:

- some users can draft/create
- some users can submit
- some users can approve

Do not collapse those roles without a business reason.

### 11.7 Approved vs Noise Reports

Utilities reporting now separates:

- approved data
- unapproved or incomplete data

This is intentional.

Rule:

- clean business reports should not mix approved and noisy records unless explicitly requested

### 11.8 Attachments

Utilities supports PDF bill upload.

Client flow:

- create record
- upload PDF
- show preview card in form

Server rule:

- PDF only
- max size enforced
- metadata saved in DB
- physical file saved in storage

### 11.9 Why Utilities Matters

Utilities already contains:

- master data dependency
- conditional form logic
- overlap validation
- aggregation logic
- attachment upload
- report integration
- submit/approve workflow
- email trigger integration

That makes it the best practical pattern for future production modules.

---

## 12. Reports System

Main client page:

- `client/src/core/ReportsPage.tsx`

Main server area:

- `server/src/features/routes/reports/`
- `server/src/features/modules/reports/`
- `server/src/core/routes/report-definitions/`

### 12.1 Report Architecture

Reports are DB-driven.

There are 2 parts:

1. report definitions
   - name
   - description
   - key
   - SQL template
   - variable definitions

2. report execution
   - inject allowed variables
   - run read-only query
   - preview result
   - download CSV

### 12.2 Why This Pattern Was Chosen

This is better than hardcoding every report in frontend files because:

- non-code report changes become easier
- report list can grow without route explosion
- settings can manage report behavior

### 12.3 Report Safety Rules

Current intent:

- reports should be read-only
- execution should be controlled
- timeouts must exist

If you touch report runner code:

1. preserve read-only intent
2. preserve timeout handling
3. validate variable substitution carefully
4. do not allow arbitrary destructive SQL

### 12.4 Report UI Rules

Current UI expectations:

- report search
- compact header
- single-button grid/list toggle
- preview before download
- preview modal where only table area scrolls

Maintain that behavior.

---

## 13. Email System

Main areas:

- `server/src/core/shared/smtp-client.js`
- `server/src/core/shared/login-log-email.js`
- `server/src/core/shared/email-settings.js`
- `client/src/core/settings/SettingsEmailPage.tsx`
- `client/src/core/settings/modules/EmailSettingsModule.tsx`

### 13.1 Current Email Use Cases

Current email-related work includes:

- login log email
- utility approval submission email

These are settings-driven.

### 13.2 Email Configuration Model

Email settings are stored in DB.

That includes:

- active or inactive state
- SMTP host
- SMTP port
- secure mode
- username
- password
- sender information
- recipient list
- subject template
- HTML template

Rule:

- configuration belongs in DB so admins can manage it

### 13.3 Email Failure Handling

SMTP errors were hardened to give readable messages.

Example:

- if SMTP host DNS cannot resolve, logs now clearly say that

This matters because many email problems are infrastructure problems, not code problems.

### 13.4 Infrastructure Rule

If SMTP host does not resolve:

- application code cannot fix that

Typical causes:

- wrong SMTP host
- DNS propagation delay
- missing DNS record

Do not waste time rewriting mail code before checking infrastructure truth.

---

## 14. Authentication and Permissions

Auth and permission checks are core infrastructure.

Junior rule:

- never expose a dangerous action only in UI and assume that is secure

Every important action must be protected in backend too.

Typical security split:

- UI can hide or show actions
- server must enforce who can actually do them

When adding a feature:

1. add permission key
2. use it in server route
3. gate button visibility in client
4. test forbidden behavior from API path too

---

## 15. Local Development Workflow

## 15.1 Start the App

From repo root:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:server
npm run dev:client
```

## 15.2 Check the API

Health endpoint:

```text
/api/health
```

If this fails, fix backend before debugging frontend.

## 15.3 Storage Check

If `UPLOADS_DIR` is empty in development:

- files should appear under `EMS/storage/cdn`

If they do not:

1. check server startup
2. check file upload route
3. check path generation logic

## 15.4 Proxy Check

If frontend says server returned HTML instead of JSON:

- usually Vite proxy is wrong
- or backend route is missing

Check:

- `client/vite.config.ts`

---

## 16. How to Maintain This Codebase Safely

## 16.1 Before Editing

Always answer these questions first:

1. Is this `core` or `feature` code?
2. Is truth owned by client or server?
3. Does this change affect DB schema?
4. Does it affect stored files?
5. Does it affect permissions?
6. Does it affect report output?

If you cannot answer those, do not patch blindly.

## 16.2 When Adding a New Business Module

Recommended order:

1. design data model
2. add DB tables or extend existing tables
3. add permission keys
4. add backend validation and routes
5. add client API file
6. add page container
7. add create/edit flows
8. add file handling only if needed
9. add reports only after core workflow is stable

## 16.3 When Changing a Form

Check:

- is this field really needed
- is it derived from master data
- is it editable or read-only
- is validation UX clear
- is server validation aligned

Utilities is a good example:

- meter is selected, not typed
- source and unit are derived, not manually edited

## 16.4 When Changing Storage

Never break these guarantees:

- existing file URLs should keep working
- new uploads should go to stable structured paths
- production uploads must survive redeploy

## 16.5 When Changing Reports

Check:

- definition storage
- variable handling
- timeout behavior
- preview UI
- CSV export
- approved vs unapproved data separation

## 16.6 When Changing Email

Check:

- settings UI
- DB config row
- server send trigger
- SMTP connectivity
- whether failure should block the core business action or not

Usually:

- business action should succeed even if notification email fails

That is the safer design.

---

## 17. Troubleshooting Guide

## 17.1 Server Returned HTML Instead of JSON

Likely causes:

- Vite proxy missing
- wrong backend route
- backend not running

Check:

- `client/vite.config.ts`
- backend startup logs

## 17.2 Startup Fails With Missing Relation

Likely cause:

- Prisma migrations were not applied

Check:

- `server/prisma/migrations/`
- `npm run prisma:migrate:status`

## 17.3 Uploaded PDFs Disappear After Deploy

Likely cause:

- uploads stored inside release folder

Fix:

- set `UPLOADS_DIR` outside app folder

## 17.4 Email Send Fails With ENOTFOUND

Meaning:

- SMTP host cannot resolve in DNS

This is usually not an app code bug.

Check:

- SMTP host value
- DNS propagation
- actual mail provider hostname

## 17.5 Utilities Create or Edit Fails

Check these first:

- selected meter exists
- date range stays in one month
- no overlap with existing records
- required fields align with utility type
- user has permission

## 17.6 Report Preview Fails

Check:

- report definition exists
- variables are provided
- SQL is valid
- timeout is not too low
- route returns JSON

---

## 18. Deployment Checklist

Before production deployment:

1. confirm correct `server/.env`
2. confirm PostgreSQL connection
3. confirm `UPLOADS_DIR` points to persistent storage
4. confirm `/cdn` file serving works
5. confirm Vite build succeeds
6. confirm API health endpoint works
7. confirm at least one create/edit workflow
8. confirm at least one file upload
9. confirm permissions on submit/approve paths
10. confirm report preview and CSV download
11. confirm email settings and SMTP host validity

Do not skip storage and permissions checks.

Those are the easiest places to create production damage.

---

## 19. Junior Developer Rules

If you are new to this codebase, follow these rules:

1. read the module before editing it
2. find the client API file before touching UI
3. find the server route before touching DB logic
4. search for existing patterns before inventing a new one
5. keep routes thin
6. keep business rules on the server
7. keep files out of the database
8. keep uploads out of the release folder
9. do not hardcode report logic if the system already supports definitions
10. test both happy path and invalid path

If you are unsure where to put code:

- shared platform logic -> `core`
- business module logic -> `features`

---

## 20. Suggested Reading Order

If you want to learn this project like a course, read in this order:

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. this document
4. `docs/UTILITIES_MODULE_GUIDE.md`
5. `client/src/core/routes/app-route-registry.tsx`
6. `client/src/core/settings/settings-route-registry.tsx`
7. `client/src/features/UtilitiesPage/UtilitiesPage.tsx`
8. `server/src/index.js`
9. `server/src/core/shared/storage.js`
10. `server/src/features/routes/utilities.js`
11. `server/src/features/modules/utilities/`

That order gives a junior developer the fastest mental model.

---

## 21. Final Summary

This codebase is not a random set of pages.
It has a clear intended shape:

- platform code in `core`
- business code in `features`
- DB for structured truth
- storage for file binaries
- server for business rules
- client for workflow and UI

If you maintain that separation, the project stays manageable.
If you mix concerns, it becomes expensive to maintain very quickly.

When in doubt, copy the better patterns already used in:

- utilities
- reports
- settings
- storage handling

That is the safest way to extend the system.
