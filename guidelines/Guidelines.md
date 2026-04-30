# Development Guidelines

## Folder Strategy

Use two top-level sections inside app code:

- `core`
- `features`

## What Goes In `core`

Put reusable app foundation here:

- app bootstrap
- auth and session
- shared state
- layouts and navigation
- theme and design tokens
- shared UI primitives
- settings
- reports
- shared helpers and types

If a future app will probably need it, it belongs in `core`.

## What Goes In `features`

Put business-specific modules here:

- utilities
- audits
- chemicals
- waste
- incidents
- training

If removing a module should still leave a usable app shell, it belongs in `features`.

## File Placement Rules

- Keep related files in the same feature folder.
- Prefer small folders over flat page sprawl.
- Use clear names like `components`, `hooks`, `api`, `types`, `helpers`.
- Avoid reviving generic catch-all folders when a feature folder is more specific.

## Import Rules

- Prefer `@/core/...` for reusable app code.
- Prefer `@/features/...` for business modules.
- Do not add new imports from legacy `pages`, `app`, or old mixed roots.

## Reuse Goal

The target is simple:

1. keep `core`
2. add only the needed `features`
3. ship a new app without rebuilding the shell

## Design Rules

Prefer a clean modern work-app pattern:

- quiet neutral canvas
- crisp borders
- restrained shadows
- compact spacing
- dense but readable information layout
- sidebar and topbar as stable chrome, not decorative panels

Follow a ClickUp-like interaction style, not a marketing-page style:

- keep pages operational
- use sections and tables for work
- avoid oversized hero composition
- avoid heavy tint backgrounds on every surface
- use color mostly for status, focus, and key actions

Keep branding separate from layout:

- brand mark can be expressive
- shell should stay calm and reusable
