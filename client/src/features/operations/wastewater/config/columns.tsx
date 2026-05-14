import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";
import type { DataColumn } from "@/components/table/DataTable";

export function getWastewaterColumns(): Array<DataColumn<WastewaterRecord>> {
  return [
    {
      id: "sampleDate",
      header: "Sample",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium capitalize">{r.point}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {formatDate(r.sampleDate)} • {r.point}
          </div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "ph",
      header: "pH",
      cell: (r) => <div className="text-right font-medium tabular-nums">{r.pH}</div>,
      className: "text-right min-w-[90px]",
    },
    {
      id: "cod",
      header: "COD",
      cell: (r) => <div className="text-right font-medium tabular-nums">{r.COD} mg/L</div>,
      className: "text-right min-w-[120px]",
    },
    {
      id: "bod",
      header: "BOD",
      cell: (r) => <div className="text-right font-medium tabular-nums">{r.BOD} mg/L</div>,
      className: "text-right min-w-[120px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <div className="flex justify-end">
          <StatusBadge tone={r.exceedance?.length ? "critical" : "compliant"}>
            {r.exceedance?.length ? "exceedance" : "compliant"}
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[120px]",
    },
  ];
}
