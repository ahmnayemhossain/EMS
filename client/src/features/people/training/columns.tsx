import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { TrainingRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";
import type { DataColumn } from "@/components/table/DataTable";

export function getTrainingColumns(): Array<DataColumn<TrainingRecord>> {
  return [
    {
      id: "title",
      header: "Training",
      cell: (t) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{t.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {t.audience} • {getFacilityName(t.facilityId)}
          </div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (t) => (
        <StatusBadge tone={t.status === "complete" ? "compliant" : t.status === "due_soon" ? "warning" : "critical"}>
          {t.status.replace(/_/g, " ")}
        </StatusBadge>
      ),
      className: "min-w-[120px]",
    },
    {
      id: "completedOn",
      header: "Completed",
      cell: (t) => <div className="text-sm">{formatDate(t.completedOn)}</div>,
      className: "min-w-[140px]",
    },
    {
      id: "nextDueOn",
      header: "Next due",
      cell: (t) => <div className="text-sm">{t.nextDueOn ? formatDate(t.nextDueOn) : "—"}</div>,
      className: "min-w-[140px]",
    },
  ];
}
