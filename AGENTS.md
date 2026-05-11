# Project Instructions for Codex

## Frontend Architecture Rules

Before refactoring, inspect the existing app UI, routes, sidebar navigation, pages, and layout behavior.

Do not blindly move files. First understand:

- How the current UI navigation works
- Which sidebar item opens which page
- Which files are shared components
- Which files are page-specific
- Which files are layout/core files

## Client Folder Structure

The `client/` folder must have only these main folders:

```txt
client/
  components/
  core/
  features/
```
