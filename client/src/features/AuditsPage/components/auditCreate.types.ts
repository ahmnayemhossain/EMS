import type { AuditFindingRecord } from "@/core/types/audit";
import type { FindingSeverity } from "@/core/types/ems";

export type FindingDraft = {
  id: string;
  severity: FindingSeverity;
  area: AuditFindingRecord["area"];
  customerName: string;
  title: string;
  description: string;
  action: string;
  responsiblePerson: string;
  responsibleTeam: string;
  startDate: string;
  dueDate: string;
  status: AuditFindingRecord["status"];
};

