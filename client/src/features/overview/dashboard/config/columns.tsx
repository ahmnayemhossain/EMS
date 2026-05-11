import { Link } from "react-router";

import type { DataColumn } from "@/components/table/DataTable";
import { RiskBadge } from "@/components/feedback/RiskBadge";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Facility } from "@/core/types/models/ems";

export function getFacilityColumns(): Array<DataColumn<Facility>> {
  return [
    {
      id: "company",
      header: "Company",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {row.location.city} â€¢ {row.code}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    { id: "risk", header: "Risk", cell: (row) => <RiskBadge level={row.riskLevel} /> },
    {
      id: "readiness",
      header: "Audit readiness",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge
            tone={
              row.auditReadinessScore >= 85
                ? "compliant"
                : row.auditReadinessScore >= 70
                  ? "warning"
                  : "critical"
            }
          >
            {row.auditReadinessScore}%
          </StatusBadge>
        </div>
      ),
    },
    {
      id: "compliance",
      header: "Compliance",
      cell: (row) => (
        <StatusBadge
          tone={
            row.complianceScore >= 85
              ? "compliant"
              : row.complianceScore >= 70
                ? "warning"
                : "critical"
          }
        >
          {row.complianceScore}%
        </StatusBadge>
      ),
    },
    {
      id: "action",
      header: "",
      cell: (row) => (
        <Link to={`/companies/${row.id}`} className="text-primary text-sm font-medium hover:underline">
          Open
        </Link>
      ),
      className: "text-right",
    },
  ];
}


