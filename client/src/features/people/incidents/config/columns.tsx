import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { Incident } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";
import type { DataColumn } from "@/components/table/DataTable";

export function getIncidentColumns(): Array<DataColumn<Incident>> {
  return [
    {
      id: "title",
      header: "Incident",
      cell: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{i.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(i.facilityId)} • {formatDate(i.date)}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    {
      id: "severity",
      header: "Severity",
      cell: (i) => (
        <StatusBadge tone={i.severity === "high" ? "critical" : i.severity === "medium" ? "warning" : "neutral"}>
          {i.severity}
        </StatusBadge>
      ),
      className: "min-w-[120px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => (
        <StatusBadge tone={i.status === "closed" ? "compliant" : i.status === "investigating" ? "warning" : "critical"}>
          {i.status}
        </StatusBadge>
      ),
      className: "min-w-[140px]",
    },
  ];
}
