import type { Audit, FindingSeverity, ID } from "@/core/types/ems";

export type AuditItemStatus = "pass" | "fail" | "na" | "pending";

export type AuditChecklistResponse = {
  itemId: string;
  status: AuditItemStatus;
  note?: string;
  evidenceCount?: number;
};

export type AuditFindingRecord = {
  id: ID;
  severity: FindingSeverity;
  area:
    | "utilities"
    | "wastewater"
    | "chemicals"
    | "waste"
    | "documents"
    | "training"
    | "general";
  title: string;
  description?: string;
  customerName?: string;
  action?: string;
  responsiblePerson?: string;
  responsibleTeam?: string;
  status: "open" | "in_progress" | "closed";
  startDate?: string;
  dueDate?: string;
  owner?: string;
  evidenceCount?: number;
};

export type AuditRecord = Audit & {
  templateId: string;
  createdAt: string; // ISO date-time
  checklist: AuditChecklistResponse[];
  findings: AuditFindingRecord[];
};
