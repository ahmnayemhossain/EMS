import { auditTemplates } from "@/data/audit-templates";
import { audits, facilities } from "@/data/mock";
import type { AuditItemStatus, AuditRecord } from "@/types/audit";

function makeRng(seed: number) {
  // xorshift32
  let x = seed || 1;
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10_000) / 10_000;
  };
}

function pickTemplateId(idx: number) {
  const ids = auditTemplates.map((t) => t.id);
  return ids[idx % ids.length] ?? "tmpl_iso14001_ems";
}

function statusFromRng(r: number): AuditItemStatus {
  // Mostly pass, some pending, few fail/na
  if (r < 0.08) return "fail";
  if (r < 0.16) return "pending";
  if (r < 0.22) return "na";
  return "pass";
}

function collectTemplateItemIds(templateId: string) {
  const t = auditTemplates.find((x) => x.id === templateId) ?? auditTemplates[0];
  const out: string[] = [];
  for (const s of t.sections) for (const it of s.items) out.push(it.id);
  return out;
}

function computeProgress(statuses: AuditItemStatus[]) {
  const total = statuses.length || 1;
  const completed = statuses.filter((s) => s !== "pending").length;
  return Math.round((completed / total) * 100);
}

function computeScore(statuses: AuditItemStatus[]) {
  // Simple scoring: pass=1, na excluded, fail=0, pending=0.5
  const relevant = statuses.filter((s) => s !== "na");
  const total = relevant.length || 1;
  const points = relevant.reduce((sum, s) => {
    if (s === "pass") return sum + 1;
    if (s === "pending") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / total) * 100);
}

export const auditRecords: AuditRecord[] = audits.map((a, idx) => {
  const templateId = pickTemplateId(idx);
  const itemIds = collectTemplateItemIds(templateId);
  const rand = makeRng(idx + 101);

  const checklist = itemIds.map((itemId) => {
    const status = statusFromRng(rand());
    return {
      itemId,
      status,
      evidenceCount:
        status === "pass" ? (rand() < 0.4 ? 1 : rand() < 0.8 ? 2 : 3) : 0,
    };
  });

  const statuses = checklist.map((c) => c.status);
  const progress = computeProgress(statuses);
  const overallScore = computeScore(statuses);

  const findings: AuditRecord["findings"] = [];
  if (rand() < 0.45) {
    findings.push({
      id: `af_${a.id}_1`,
      severity: "major",
      area: "wastewater",
      title: "ETP logbook has missing dosing entries",
      status: "open",
      dueDate: "2026-04-30",
      owner: "Munna (700902)",
      evidenceCount: 1,
    });
  }
  if (rand() < 0.25) {
    findings.push({
      id: `af_${a.id}_2`,
      severity: "critical",
      area: "chemicals",
      title: "Restricted chemical approval evidence missing",
      status: "in_progress",
      dueDate: "2026-04-20",
      owner: "Sakib (700903)",
      evidenceCount: 0,
    });
  }

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
