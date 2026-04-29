import { audits, facilities } from "@/data/mock";
import type { AuditRecord } from "@/types/audit";
import { buildAuditFindings } from "@/data/audit-records.findings";
import { collectTemplateItemIds, computeProgress, computeScore, makeRng, pickTemplateId, statusFromRng } from "@/data/audit-records.helpers";

export const auditRecords: AuditRecord[] = audits.map((a, idx) => {
  const templateId = pickTemplateId(idx);
  const itemIds = collectTemplateItemIds(templateId);
  const rand = makeRng(idx + 101);
  const checklist = itemIds.map((itemId) => buildChecklistItem(itemId, rand));
  const statuses = checklist.map((c) => c.status);
  const progress = computeProgress(statuses);
  const overallScore = computeScore(statuses);
  const findings = buildAuditFindings(a.id, a.customerName, rand);
  const findingsCount = {
    minor: findings.filter((f) => f.severity === "minor").length,
    major: findings.filter((f) => f.severity === "major").length,
    critical: findings.filter((f) => f.severity === "critical").length,
  };

  return {
    ...a,
    facilityId: a.facilityId ?? facilities[idx % facilities.length]!.id,
    templateId,
    createdAt: "2026-04-05T10:00:00+06:00",
    checklist,
    findings,
    progress,
    overallScore,
    findingsCount,
  };
});

function buildChecklistItem(itemId: string, rand: () => number) {
  const status = statusFromRng(rand());
  return { itemId, status, evidenceCount: status === "pass" ? (rand() < 0.4 ? 1 : rand() < 0.8 ? 2 : 3) : 0 };
}
