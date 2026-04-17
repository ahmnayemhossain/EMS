import type { DataColumn } from "@/components/DataTable";
import type { UtilityRecord } from "@/types/ems";

import { Button } from "@/app/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";
import { formatDate, formatNumber, formatUtilityType } from "@/utils/format";

export function getUtilityColumns(): Array<DataColumn<UtilityRecord>> {
  return [
    {
      id: "factory",
      header: "Factory",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{getFacilityName(r.facilityId)}</div>
          <div className="text-muted-foreground mt-1 text-xs">{r.meterName}</div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "period",
      header: "Period",
      cell: (r) => (
        <div className="text-sm">
          <div>
            {formatDate(r.periodStart)} → {formatDate(r.periodEnd)}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {formatUtilityType(r.type)}
          </div>
        </div>
      ),
      className: "min-w-[220px]",
    },
    {
      id: "value",
      header: "Reading",
      cell: (r) => (
        <div className="text-right font-medium tabular-nums">
          {formatNumber(r.value)} {r.uom}
        </div>
      ),
      className: "text-right min-w-[160px]",
    },
    {
      id: "variance",
      header: "Variance",
      cell: (r) => {
        const tone =
          r.varianceFlag === "high"
            ? "critical"
            : r.varianceFlag === "watch"
              ? "warning"
              : "compliant";
        return (
          <div className="flex justify-end">
            <StatusBadge tone={tone}>{r.varianceFlag ?? "normal"}</StatusBadge>
          </div>
        );
      },
      className: "text-right min-w-[140px]",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button variant="outline" size="sm">
            View
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];
}

