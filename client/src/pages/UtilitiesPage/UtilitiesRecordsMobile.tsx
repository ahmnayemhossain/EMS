import { ChevronRight } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";
import type { UtilityRecord } from "@/types/ems";
import { formatDate, formatNumber } from "@/utils/format";

export function UtilitiesRecordsMobile({
  rows,
  onSelect,
}: {
  rows: UtilityRecord[];
  onSelect: (row: UtilityRecord) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Utility records</div>
      <div className="rounded-xl border divide-y overflow-hidden">
        {rows.length ? (
          rows.map((r) => {
            const tone =
              r.varianceFlag === "high"
                ? "critical"
                : r.varianceFlag === "watch"
                  ? "warning"
                  : "compliant";

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className={cn(
                  "w-full text-left px-3 py-3 hover:bg-muted/30 active:bg-muted/40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">
                        {getFacilityName(r.facilityId)}
                      </div>
                      <StatusBadge tone={tone} className="shrink-0">
                        {r.varianceFlag ?? "normal"}
                      </StatusBadge>
                    </div>
                    <div className="text-muted-foreground mt-1 truncate text-xs">
                      {r.meterName}
                    </div>
                    <div className="text-muted-foreground mt-2 text-[11px]">
                      {formatDate(r.periodStart)} → {formatDate(r.periodEnd)}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatNumber(r.value)} {r.uom}
                    </div>
                    <ChevronRight className="text-muted-foreground ml-auto mt-1 size-4" />
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-muted-foreground p-4 text-sm">No records found.</div>
        )}
      </div>
    </div>
  );
}

