import type { AuditRecord } from "@/types/audit";

import { formatAuditDate } from "../../audit.helpers";

export function formatFindingTimeline(finding: AuditRecord["findings"][number]) {
  const start = finding.startDate ? formatAuditDate(finding.startDate) : null;
  const due = finding.dueDate ? formatAuditDate(finding.dueDate) : null;
  if (start && due) return `${start} → ${due}`;
  if (due) return `Due ${due}`;
  if (start) return `From ${start}`;
  return null;
}
