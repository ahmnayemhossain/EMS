# Utilities Module Guide

## Goal

Utilities is the first production-oriented module. It should stay the cleanest reference module in the repo.

## Input Flow

1. User opens create/edit modal
2. UI enables or disables fields by utility type
3. UI submits record JSON
4. Backend saves utility record
5. If a PDF is attached, client uploads it after the record exists
6. Backend stores the PDF in CDN storage and writes metadata to `file_assets`
7. Record returns with `billFiles` ready for UI display

## Utility Type UI Rule

All utility types use the same modal structure.

The utility type decides which inputs are active:

- `electricity`
  - source enabled
  - meter reading enabled
- `water`
  - source enabled
  - meter reading enabled
- `fuel`
  - source enabled
  - manual consumption enabled
- `steam`
  - source disabled
  - meter reading enabled
- `refrigerant`
  - source disabled
  - manual quantity enabled
- `other`
  - source disabled
  - manual quantity enabled

## Attachment Rule

- attachment type: PDF only
- max size: 10 MB
- actual file goes to storage/CDN
- metadata goes to DB

## Route Rule

Keep route files focused on:

- request parsing
- permission enforcement
- orchestration
- response shape

Move these out of route files:

- long validators
- overlap checks
- storage path logic
- file metadata sync

## Naming Rule

Keep names aligned across:

- UI label
- API route
- DB table
- metadata `module` value

Example:

- UI: `Utilities`
- route: `/api/utilities`
- record table: `utility_records`
- file metadata module: `utilities`

## Future Modules

When building a new production-ready module, follow this order:

1. DB table
2. lookup validation
3. permission mapping
4. route
5. client API
6. page container
7. create/edit form
8. optional file storage integration
