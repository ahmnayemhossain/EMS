import type { ID } from "@/core/types/ems/core";

export type FindingSeverity = "minor" | "major" | "critical";

export type Finding = {
  id: ID;
  auditId: ID;
  facilityId: ID;
  title: string;
  severity: FindingSeverity;
  area:
    | "utilities"
    | "wastewater"
    | "chemicals"
    | "waste"
    | "documents"
    | "training"
    | "general";
  status: "open" | "in_progress" | "closed";
  dueDate?: string;
};

export type Audit = {
  id: ID;
  facilityId: ID;
  name: string; // e.g. "ISO 14001 Internal Audit"
  customerName?: string;
  date: string; // ISO date
  nextAuditDate?: string; // ISO date
  auditor: string;
  progress: number; // 0-100 checklist progress
  overallScore: number; // 0-100
  findingsCount: { minor: number; major: number; critical: number };
};

export type CAPA = {
  id: ID;
  facilityId: ID;
  title: string;
  owner: string;
  description?: string;
  severity: FindingSeverity;
  status: "open" | "in_progress" | "pending_verification" | "closed" | "overdue";
  dueDate: string; // ISO date
  evidenceCount: number;
  relatedFindingId?: ID;
  positionIndex?: number;
  dismissed?: boolean;
};

