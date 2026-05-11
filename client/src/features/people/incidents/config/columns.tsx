import * as React from "react";

import { Button } from "@/components/ui/primitives/button";
import type { DataColumn } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { Incident } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function getIncidentColumns(): Array<DataColumn<Incident>> {
  return [
    {
      id: "incident",
      header: "Incident",
      cell: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{i.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(i.facilityId)} â€¢ {formatDate(i.date)}
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


