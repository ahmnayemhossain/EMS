# Utilities UAT Checklist

## Scope
- Module: `Utilities`
- Workflow: `Draft -> Submitted -> Approved -> Audited`
- Reverse path:
  - `Audited -> Approved`
  - `Approved -> Submitted`
  - `Submitted -> Draft`

## User Roles
- `Utilities Preparer`
- `Utilities Approver`
- `Utilities Auditor`
- `Admin`

## UAT Cases

### 1. Draft Creation
- Create a new utility record for a valid meter and month.
- Confirm the month aggregate status is `Draft`.
- Confirm the drawer timeline shows the draft creator and timestamp.

### 2. Submit Flow
- Login as `Utilities Preparer`.
- Open a full-month complete record.
- Confirm `Ready to Submitted` action is available.
- Save the action.
- Confirm:
  - status changes to `Submitted`
  - timeline shows checkmark on `Submitted`
  - approval history stores actor and time

### 3. Approve Flow
- Login as `Utilities Approver`.
- Open the submitted month.
- Confirm `Ready to Approved` action is available.
- Save the action.
- Confirm:
  - status changes to `Approved`
  - `approved_by` and `approved_at` are populated
  - approved report includes the month

### 4. Audit Flow
- Login as `Utilities Auditor`.
- Open the approved month.
- Confirm `Ready to Audited` action is available.
- Save the action.
- Confirm:
  - status changes to `Audited`
  - timeline shows completed audit step

### 5. Reverse from Audited
- Login as `Utilities Auditor`.
- Open an audited month.
- Click `Reject`.
- Enter reject note.
- Confirm:
  - note is mandatory
  - status changes to `Approved`
  - timeline shows red `X` on `Audited`
  - note is stored in approval history

### 6. Reverse from Approved
- Login as `Utilities Approver`.
- Open an approved month.
- Click `Reject`.
- Enter reject note.
- Confirm:
  - status changes to `Submitted`
  - timeline shows red `X` on `Approved`
  - note is stored in approval history

### 7. Reverse from Submitted
- Login as `Utilities Preparer`.
- Open a submitted month.
- Click `Reject`.
- Enter reject note.
- Confirm:
  - status changes to `Draft`
  - timeline shows red `X` on `Submitted`

### 8. Role Control
- `Utilities Preparer` cannot approve or audit.
- `Utilities Approver` cannot audit.
- `Utilities Auditor` cannot submit a draft directly.
- `Admin` can perform any valid adjacent forward or reverse step.

### 9. Month Control
- Incomplete month cannot move forward.
- Date overlap is blocked.
- Cross-month entry is blocked.
- Editing an approved or audited month resets the month back to `Draft` when month content changes.

### 10. Attachment and Export
- Upload bill file during create or edit.
- Open/download bill file from detail view.
- Export report from drawer.
- Confirm exported report includes:
  - company
  - utility
  - source
  - meter
  - period
  - workflow
  - readings
  - diesel
  - missing ranges
  - bill file names
  - approval history
  - reject notes

### 11. Reports
- Check `utilities_approved_data_report`.
- Check `utilities_unapproved_data_report`.
- Confirm status, approver, and month totals match actual utility month state.

## Sign-off
- Preparer:
- Approver:
- Auditor:
- Admin:
- Business owner:
- Date:
