import * as React from "react";

import type { DataColumn } from "@/core/components/DataTable";
import { StatusBadge } from "@/core/components/StatusBadge";
import { getFacilityName } from "@/core/data/mock";
import type { TrainingRecord } from "@/core/types/ems";
import { formatDate } from "@/core/utils/format";

export function getTrainingColumns(): Array<DataColumn<TrainingRecord>> {
  return [
    {
      id: "training",
      header: "Training",
      cell: (t) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{t.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {t.audience} • {getFacilityName(t.facilityId)}
          </div>
        </div>
      ),
      className: "min-w-[420px]",
    },
    {
      id: "completed",
      header: "Completed",
      cell: (t) => <div className="text-sm">{formatDate(t.completedOn)}</div>,
      className: "min-w-[160px]",
    },
    {
      id: "next",
      header: "Next due",
      cell: (t) => <div className="text-sm">{t.nextDueOn ? formatDate(t.nextDueOn) : "—"}</div>,
      className: "min-w-[160px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (t) => (
        <StatusBadge
          tone={
            t.status === "complete"
              ? "compliant"
              : t.status === "due_soon"
                ? "warning"
                : "critical"
          }
        >
          {t.status.replace(/_/g, " ")}
        </StatusBadge>
      ),
      className: "min-w-[160px]",
    },
  ];
}

