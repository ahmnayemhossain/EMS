# EMS - Final Feature List

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
