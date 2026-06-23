import { getTemplateById } from "@/core/data/catalog/audit-templates";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Progress } from "@/components/ui/primitives/progress";
import type { DataColumn } from "@/components/table/DataTable";
import type { AuditRecord } from "@/core/types/models/audit";

import { formatAuditDate } from "../../config/audit.helpers";

export function getAuditColumns(): Array<DataColumn<AuditRecord>> {
  return [
    {
      id: "name",
      header: "Audit",
      cell: (audit) => {
        const templateName = getTemplateById(audit.templateId)?.name ?? "Template";
        return (
          <div className="min-w-0">
            <div className="break-words text-sm font-medium leading-snug md:truncate">{audit.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {audit.companyName || audit.facilityId}
              {audit.customerName ? ` • ${audit.customerName}` : ""} • {formatAuditDate(audit.date)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge tone="neutral">{templateName}</StatusBadge>
              {audit.nextAuditDate ? (
                <StatusBadge tone="neutral">Next {formatAuditDate(audit.nextAuditDate)}</StatusBadge>
              ) : null}
              <StatusBadge
                tone={
                  audit.overallScore >= 85
                    ? "compliant"
                    : audit.overallScore >= 70
                      ? "warning"
                      : "critical"
                }
              >
                Score {audit.overallScore}%
              </StatusBadge>
            </div>
          </div>
        );
      },
      className: "whitespace-normal",
    },
    {
      id: "progress",
      header: "Checklist",
      cell: (audit) => (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{audit.progress}%</span>
          </div>
          <Progress value={audit.progress} className="mt-2" />
        </div>
      ),
      className: "hidden lg:table-cell whitespace-normal",
    },
    {
      id: "findings",
      header: "Findings",
      cell: (audit) => (
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge tone="neutral">Minor {audit.findingsCount.minor}</StatusBadge>
          <StatusBadge tone="warning">Major {audit.findingsCount.major}</StatusBadge>
          <StatusBadge tone="critical">Critical {audit.findingsCount.critical}</StatusBadge>
        </div>
      ),
      className: "hidden xl:table-cell text-right whitespace-normal",
    },
  ];
}
