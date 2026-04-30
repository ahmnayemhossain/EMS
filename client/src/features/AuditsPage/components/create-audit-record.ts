import { toast } from "@/core/app/lib/toast";
import type { AuditRecord } from "@/core/types/audit";

import { computeChecklistStats, defaultStatusesForTemplate } from "../audit.helpers";
import { buildAuditRecord, buildFindings } from "./auditCreate.helpers";
import type { FindingDraft } from "./auditCreate.types";

export function createAuditRecord({
  name,
  facilityId,
  auditor,
  customerName,
  date,
  nextAuditDate,
  templateId,
  findingsDrafts,
  onCreate,
}: {
  name: string;
  facilityId: string;
  auditor: string;
  customerName: string;
  date: string;
  nextAuditDate: string;
  templateId: string;
  findingsDrafts: FindingDraft[];
  onCreate: (record: AuditRecord) => void;
}) {
  if (!name.trim()) return toast.error("Audit name is required"), false;
  if (!facilityId) return toast.error("Select a company"), false;
  if (!auditor) return toast.error("Select an auditor"), false;
  const statusesByItemId = defaultStatusesForTemplate(templateId);
  const computed = computeChecklistStats(templateId, statusesByItemId);
  const checklist = Object.entries(statusesByItemId).map(([itemId, status]) => ({ itemId, status, evidenceCount: 0 }));
  const findings = buildFindings({ drafts: findingsDrafts, fallbackCustomerName: customerName });
  onCreate(buildAuditRecord({ id: `audit_${Date.now()}`, nowIso: new Date().toISOString(), facilityId, name, customerName, date, nextAuditDate, auditor, templateId, progress: computed.progress, overallScore: computed.score, checklist, findings }));
  toast.success("Audit created (mock)");
  return true;
}
