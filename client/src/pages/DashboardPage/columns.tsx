import { Link } from "react-router";

import { Button } from "@/app/components/ui/button";
import type { DataColumn } from "@/components/DataTable";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import type { Facility } from "@/types/ems";

export function getFacilityColumns(): Array<DataColumn<Facility>> {
  return [
    {
      id: "factory",
      header: "Factory",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {row.location.city} • {row.code}
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
        <Button asChild variant="outline" size="sm">
          <Link to={`/factories/${row.id}`}>Open</Link>
        </Button>
      ),
      className: "text-right",
    },
  ];
}

