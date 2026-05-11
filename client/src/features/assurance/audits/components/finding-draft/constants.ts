import type { AuditFindingRecord } from "@/core/types/models/audit";

export const STATUSES: Array<{ value: AuditFindingRecord["status"]; label: string }> = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];
