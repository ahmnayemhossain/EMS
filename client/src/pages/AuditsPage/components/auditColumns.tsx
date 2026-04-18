import { getTemplateById } from "@/data/audit-templates";
import { getFacilityName } from "@/data/mock";
import { Progress } from "@/app/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import type { AuditRecord } from "@/types/audit";
import type { DataColumn } from "@/components/DataTable";
import { formatAuditDate } from "../audit.helpers";

export function getAuditColumns(): Array<DataColumn<AuditRecord>> {
  return [
    {
      id: "name",
      header: "Audit",
      cell: (a) => {
        const templateName = getTemplateById(a.templateId)?.name ?? "Template";
        return (
          <div className="min-w-0">
            <div className="break-words text-sm font-medium leading-snug md:truncate">
              {a.name}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {getFacilityName(a.facilityId)} • {formatAuditDate(a.date)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge tone="neutral">{templateName}</StatusBadge>
              <StatusBadge
                tone={
                  a.overallScore >= 85
                    ? "compliant"
                    : a.overallScore >= 70
                      ? "warning"
                      : "critical"
                }
              >
                Score {a.overallScore}%
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
      cell: (a) => (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{a.progress}%</span>
          </div>
          <Progress value={a.progress} className="mt-2" />
        </div>
      ),
      className: "hidden lg:table-cell whitespace-normal",
    },
    {
      id: "findings",
      header: "Findings",
      cell: (a) => (
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge tone="neutral">Minor {a.findingsCount.minor}</StatusBadge>
          <StatusBadge tone="warning">Major {a.findingsCount.major}</StatusBadge>
          <StatusBadge tone="critical">Critical {a.findingsCount.critical}</StatusBadge>
        </div>
      ),
      className: "hidden xl:table-cell text-right whitespace-normal",
    },
  ];
}

