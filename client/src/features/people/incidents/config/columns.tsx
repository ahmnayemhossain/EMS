import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { DataColumn } from "@/components/table/DataTable";
import { getCompanyName } from "@/core/companies/directory";
import type { Incident } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";
import type { CompanyOption } from "@/core/app/state/slices/company";

export function getIncidentColumns(companies: CompanyOption[]): Array<DataColumn<Incident>> {
  return [
    {
      id: "title",
      header: "Incident",
      cell: (incident) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{incident.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getCompanyName(incident.facilityId, companies)} • {formatDate(incident.date)}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    {
      id: "severity",
      header: "Severity",
      cell: (incident) => (
        <StatusBadge tone={incident.severity === "high" ? "critical" : incident.severity === "medium" ? "warning" : "neutral"}>
          {incident.severity}
        </StatusBadge>
      ),
      className: "min-w-[120px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (incident) => (
        <StatusBadge tone={incident.status === "closed" ? "compliant" : incident.status === "investigating" ? "warning" : "critical"}>
          {incident.status}
        </StatusBadge>
      ),
      className: "min-w-[140px]",
    },
  ];
}
