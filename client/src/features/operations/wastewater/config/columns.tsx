import * as React from "react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { DataColumn } from "@/components/table/DataTable";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function getWastewaterColumns({
  thresholds,
}: {
  thresholds: {
    pH: { min: number; max: number };
    COD: { max: number };
    BOD: { max: number };
  };
}): Array<DataColumn<WastewaterRecord>> {
  return [
    {
      id: "company",
      header: "Company",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{getFacilityName(r.facilityId)}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {formatDate(r.sampleDate)} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {r.point}
          </div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "ph",
      header: "pH",
      cell: (r) => (
        <StatusBadge
          tone={
            r.pH > thresholds.pH.max || r.pH < thresholds.pH.min
              ? "critical"
              : "compliant"
          }
        >
          {r.pH}
        </StatusBadge>
      ),
    },
    {
      id: "cod",
      header: "COD (mg/L)",
      cell: (r) => (
        <StatusBadge tone={r.COD > thresholds.COD.max ? "critical" : "neutral"}>
          {r.COD}
        </StatusBadge>
      ),
    },
    {
      id: "bod",
      header: "BOD (mg/L)",
      cell: (r) => (
        <StatusBadge tone={r.BOD > thresholds.BOD.max ? "warning" : "neutral"}>
          {r.BOD}
        </StatusBadge>
      ),
    },
    {
      id: "report",
      header: "Lab report",
      cell: (r) =>
        r.labReport ? (
          <div className="text-muted-foreground text-sm">{r.labReport.fileName}</div>
        ) : (
          <StatusBadge tone="warning">Missing</StatusBadge>
        ),
      className: "min-w-[220px]",
    },
  ];
}


