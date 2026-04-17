import * as React from "react";

import { Button } from "@/app/components/ui/button";
import type { DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";
import type { Incident } from "@/types/ems";
import { formatDate } from "@/utils/format";

export function getIncidentColumns(): Array<DataColumn<Incident>> {
  return [
    {
      id: "incident",
      header: "Incident",
      cell: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{i.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(i.facilityId)} • {formatDate(i.date)}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (i) => <StatusBadge tone="info">{i.type.replace(/_/g, " ")}</StatusBadge>,
      className: "whitespace-nowrap",
    },
    {
      id: "severity",
      header: "Severity",
      cell: (i) => (
        <StatusBadge
          tone={
            i.severity === "high"
              ? "critical"
              : i.severity === "medium"
                ? "warning"
                : "neutral"
          }
        >
          {i.severity}
        </StatusBadge>
      ),
      className: "whitespace-nowrap",
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => (
        <StatusBadge
          tone={
            i.status === "closed"
              ? "compliant"
              : i.status === "investigating"
                ? "warning"
                : "info"
          }
        >
          {i.status}
        </StatusBadge>
      ),
      className: "whitespace-nowrap",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button size="sm" variant="outline">
            Open
          </Button>
        </div>
      ),
      className: "text-right whitespace-nowrap",
    },
  ];
}

