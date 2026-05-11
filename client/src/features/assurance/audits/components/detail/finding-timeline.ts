import type { AuditRecord } from "@/core/types/models/audit";

import { formatAuditDate } from "../../config/audit.helpers";

export function formatFindingTimeline(finding: AuditRecord["findings"][number]) {
  const start = finding.startDate ? formatAuditDate(finding.startDate) : null;
  const due = finding.dueDate ? formatAuditDate(finding.dueDate) : null;
  if (start && due) return `${start} â†’ ${due}`;
  if (due) return `Due ${due}`;
  if (start) return `From ${start}`;
  return null;
}
