import type { AuditFindingRecord } from "@/core/types/models/audit";
import type { FindingSeverity } from "@/core/types/models/ems";

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

