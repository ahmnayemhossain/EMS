import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { DataColumn } from "@/components/table/DataTable";
import type { CompanyOption } from "@/core/app/state/slices/company";
import { getCompanyName } from "@/core/companies/directory";
import type { TrainingRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function getTrainingColumns(companies: CompanyOption[]): Array<DataColumn<TrainingRecord>> {
  return [
    {
      id: "title",
      header: "Training",
      cell: (training) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{training.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {training.audience} • {getCompanyName(training.facilityId, companies)}
          </div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (training) => (
        <StatusBadge tone={training.status === "complete" ? "compliant" : training.status === "due_soon" ? "warning" : "critical"}>
          {training.status.replace(/_/g, " ")}
        </StatusBadge>
      ),
      className: "min-w-[120px]",
    },
    {
      id: "completedOn",
      header: "Completed",
      cell: (training) => <div className="text-sm">{formatDate(training.completedOn)}</div>,
      className: "min-w-[140px]",
    },
    {
      id: "nextDueOn",
      header: "Next due",
      cell: (training) => <div className="text-sm">{training.nextDueOn ? formatDate(training.nextDueOn) : "—"}</div>,
      className: "min-w-[140px]",
    },
  ];
}
