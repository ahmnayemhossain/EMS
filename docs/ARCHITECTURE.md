# EMS Architecture

## Runtime Shape

The app now follows a practical 4-layer pattern:

1. `client/`
   - React, TypeScript, Vite
   - UI, local view state, form validation
   - Calls backend APIs only

2. `server/`
   - Express API
   - Auth, permission checks, business validation
   - Database read/write orchestration
   - Storage/CDN file orchestration

3. `database`
   - PostgreSQL
   - Numeric primary keys only
   - Business records, lookup tables, permission tables, file metadata

4. `storage/cdn`
   - Local structured file storage for now
   - Served by Express as `/cdn/*`
   - Holds actual files, not database blobs

## Current File Storage Pattern

Current root:

- `server/storage/cdn/`

Current public URL base:

- `/cdn`

Utilities PDF files are stored by segment:

```text
server/storage/cdn/
  utilities/
    company-{companyId}/
      {utilityType}/
        {yyyy}/
          {mm}/
            utilities_{utilityType}_{recordId}_{timestamp}_{random}.pdf
```

Example:

```text
server/storage/cdn/utilities/company-1/electricity/2026/04/utilities_electricity_25_20260429153010_a1b2c3d4.pdf
```

## Database Responsibility Split

Database keeps:

- business records
- lookup/master data
- permissions and role mappings
- file metadata

Database does not keep:

- raw PDF binary content

File metadata is stored in:

- `file_assets`

Important columns:

- `module`
- `entity_type`
- `entity_id`
- `company_id`
- `original_name`
- `stored_name`
- `storage_disk`
- `storage_path`
- `mime_type`
- `file_size`
- `uploaded_by_user_id`

## Utilities Module Pattern

Utilities uses a readable split:

- `server/src/routes/utilities.js`
  - route wiring only
- `server/src/modules/utilities/record.js`
  - normalization, record mapping, input validation
- `server/src/modules/utilities/access.js`
  - company access, overlap checks, lookup validation
- `server/src/modules/utilities/files.js`
  - attachment metadata, storage path, CDN file handling

This is the reference pattern for future DB-backed modules that need:

- CRUD
- permission checks
- lookup validation
- file attachments

## Client Pattern

Client modules should be shaped like this:

- page container
- small view components
- thin API file
- shared API helpers under `client/src/app/lib`

For utilities:

- `client/src/pages/UtilitiesPage/UtilitiesPage.tsx`
  - orchestrates data loading and mutations
- `client/src/pages/UtilitiesPage/CreateUtilityDialog.tsx`
  - create workflow
- `client/src/pages/UtilitiesPage/EditUtilityDialog.tsx`
  - edit workflow
- `client/src/pages/UtilitiesPage/CreateUtilityForm.tsx`
  - shared form layout
- `client/src/pages/UtilitiesPage/api.ts`
  - endpoint calls only
- `client/src/app/lib/api.ts`
  - shared auth headers, JSON parsing, file helpers

## Why This Pattern

This structure keeps the codebase readable because:

- route files stay small
- validation logic stays together
- storage logic stays together
- client pages do not own low-level API concerns
- file handling can later move to S3/R2/CDN without changing UI flow

## Near-Future Direction

When more modules become production-ready:

- reuse `file_assets` for chemicals, waste, audits, documents
- move repeated route CRUD patterns into shared module helpers only where it actually reduces complexity
- keep table names, API names, and UI names aligned
