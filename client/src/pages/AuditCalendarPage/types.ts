import type { Audit } from "@/types/ems";

export type ScheduledAudit = Audit & {
  time?: { start: string; end?: string };
};

export type AuditCalendarView = "calendar" | "list";
export type AuditListFilter = "all" | "date" | "company" | "audit" | "auditor";
