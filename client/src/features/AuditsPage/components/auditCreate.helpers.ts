import type { AuditFindingRecord, AuditRecord } from "@/core/types/audit";

import type { FindingDraft } from "./auditCreate.types";

export function countFindings(findings: AuditFindingRecord[]) {
  return {
    minor: findings.filter((f) => f.severity === "minor").length,
    major: findings.filter((f) => f.severity === "major").length,
    critical: findings.filter((f) => f.severity === "critical").length,
  };
}

export function buildFindings({
  drafts,
  fallbackCustomerName,
}: {
  drafts: FindingDraft[];
  fallbackCustomerName: string;
}): AuditFindingRecord[] {
  return drafts
    .filter((f) => f.title.trim())
    .map((f) => ({
      id: f.id,
      severity: f.severity,
      area: f.area,
      title: f.title.trim(),
      description: f.description.trim() || undefined,
      customerName: (f.customerName || fallbackCustomerName).trim() || undefined,
      action: f.action.trim() || undefined,
      responsiblePerson: f.responsiblePerson.trim() || undefined,
      responsibleTeam: f.responsibleTeam.trim() || undefined,
      status: f.status,
      startDate: f.startDate || undefined,
      dueDate: f.dueDate || undefined,
      owner: f.responsiblePerson.trim() || undefined,
      evidenceCount: 0,
    }));
}

export function buildAuditRecord({
  id,
  nowIso,
  facilityId,
  name,
  customerName,
  date,
  nextAuditDate,
  auditor,
  templateId,
  progress,
  overallScore,
  checklist,
  findings,
}: {
  id: string;
  nowIso: string;
  facilityId: string;
  name: string;
  customerName: string;
  date: string;
  nextAuditDate: string;
  auditor: string;
  templateId: string;
  progress: number;
  overallScore: number;
  checklist: AuditRecord["checklist"];
  findings: AuditFindingRecord[];
}): AuditRecord {
  return {
    id,
    facilityId,
    name: name.trim(),
    customerName: customerName.trim() || undefined,
    date: date.trim(),
    nextAuditDate: nextAuditDate.trim() || undefined,
    auditor,
    progress,
    overallScore,
    findingsCount: countFindings(findings),
    templateId,
    createdAt: nowIso,
    checklist,
    findings,
  };
}

