import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { WastewaterRecord } from "@/core/types/ems";
import { formatDate } from "@/core/utils/format";

export function FacilityWastewaterSummaryCard({
  records,
}: {
  records: WastewaterRecord[];
}) {
  const latest = records[0];

  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Wastewater summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {latest ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-muted-foreground text-xs">Latest sample</div>
                <div className="mt-1 truncate text-sm font-medium">
                  {formatDate(latest.sampleDate)} • {latest.point}
                </div>
              </div>
              <StatusBadge tone={latest.exceedance?.length ? "critical" : "compliant"}>
                {latest.exceedance?.length ? "Exceedance" : "Within limits"}
              </StatusBadge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">pH</div>
                <div className="mt-1 font-semibold">{latest.pH}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">COD</div>
                <div className="mt-1 font-semibold">{latest.COD} mg/L</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">BOD</div>
                <div className="mt-1 font-semibold">{latest.BOD} mg/L</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">TSS</div>
                <div className="mt-1 font-semibold">{latest.TSS} mg/L</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No wastewater records.</div>
        )}
      </CardContent>
    </Card>
  );
}

