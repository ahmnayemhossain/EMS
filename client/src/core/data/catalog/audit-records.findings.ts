import type { AuditRecord } from "@/core/types/models/audit";

export function buildAuditFindings(auditId: string, customerName: string, random: () => number): AuditRecord["findings"] {
  const findings: AuditRecord["findings"] = [];
  if (random() < 0.45) findings.push(buildMajorFinding(auditId, customerName));
  if (random() < 0.25) findings.push(buildCriticalFinding(auditId, customerName));
  return findings;
}

function buildMajorFinding(auditId: string, customerName: string) {
  return { id: `af_${auditId}_1`, severity: "major", area: "wastewater", title: "ETP logbook has missing dosing entries", description: "Daily dosing logs are missing for multiple shifts; records need backfill and control checks.", customerName, action: "Update logbook SOP, retrain operators, and enforce shift sign-off.", responsibleTeam: "ETP / Utilities", status: "open", startDate: "2026-04-10", dueDate: "2026-04-30", owner: "User Four (EMP-0004)", responsiblePerson: "User Four (EMP-0004)", evidenceCount: 1 } as const;
}

function buildCriticalFinding(auditId: string, customerName: string) {
  return { id: `af_${auditId}_2`, severity: "critical", area: "chemicals", title: "Restricted chemical approval evidence missing", description: "Approval documentation is incomplete for restricted chemical usage; traceability is not verifiable.", customerName, action: "Collect approval evidence, restrict issue, and update chemical register with approvals.", responsibleTeam: "EHS / Stores", status: "in_progress", startDate: "2026-04-12", dueDate: "2026-04-20", owner: "User Five (EMP-0005)", responsiblePerson: "User Five (EMP-0005)", evidenceCount: 0 } as const;
}
