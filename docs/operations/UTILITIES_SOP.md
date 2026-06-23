# Utilities SOP and Governance

## 1. Workflow Ownership

### Utilities Preparer
- Creates utility records
- Edits draft data
- Submits full-month data
- Can return `Submitted` back to `Draft`

### Utilities Approver
- Reviews submitted month data
- Approves submitted months
- Can return `Approved` back to `Submitted`

### Utilities Auditor
- Audits approved months
- Can return `Audited` back to `Approved`

### Admin
- Full override across all valid adjacent workflow steps

## 2. Workflow Standard
- `Draft`
- `Submitted`
- `Approved`
- `Audited`

Rules:
- Only adjacent forward and reverse moves are allowed.
- Reverse action always requires a reject note.
- Reject note must explain what was wrong and what needs correction.

## 3. Month Control Policy
- One record cannot cross month boundary.
- Same meter-month cannot have overlapping date ranges.
- Only full-month complete data can move beyond `Draft`.
- If month content changes after approval or audit, the month resets to `Draft`.

## 4. Master Data Governance

### Company
- Every utility record must belong to one company.

### Meter
- Meter is the primary control point for utility tracking.
- Every operational utility source must have a maintained meter record.

### Source
- Source describes origin, not the measurement point.
- Meter must be linked to the correct source.

### UOM
- UOM must be fixed by utility type and meter design.
- Do not allow arbitrary UOM change in transaction entry.

### Generator Governance
- Generator electricity must capture:
  - previous reading
  - current reading
  - diesel consumption
- Diesel is audit evidence, not an auto-calculation driver.

## 5. Reject Note Standard
Reject note should include:
- issue found
- affected date range or month
- expected correction
- reviewer initials if required by business policy

Example:
- `Missing bill evidence for 2026-05 and consumption gap on 2026-05-16 to 2026-05-18. Please correct and resubmit.`

## 6. UAT Exit Criteria
Utilities can move to production readiness only when:
- all workflow steps pass UAT
- all reverse actions pass UAT
- role visibility is correct
- approved and unapproved reports match actual month state
- bill attachment flow is verified
- export report is verified
