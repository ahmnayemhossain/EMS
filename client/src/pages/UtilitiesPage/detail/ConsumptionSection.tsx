import { StatusBadge } from "@/components/StatusBadge";
import { DetailCard } from "@/pages/UtilitiesPage/detail/DetailCard";
import type { UtilityRecord } from "@/types/ems";
import { formatNumber } from "@/utils/format";

export function ConsumptionSection({ record }: { record: UtilityRecord }) {
  const tone = record.varianceFlag === "high" ? "critical" : record.varianceFlag === "watch" ? "warning" : "compliant";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {typeof record.previousReading === "number" ? <DetailCard><div className="text-muted-foreground text-xs">Previous Reading</div><div className="mt-1 text-sm font-semibold tabular-nums">{formatNumber(record.previousReading)} {record.uom}</div></DetailCard> : null}
      {typeof record.currentReading === "number" ? <DetailCard><div className="text-muted-foreground text-xs">Current Reading</div><div className="mt-1 text-sm font-semibold tabular-nums">{formatNumber(record.currentReading)} {record.uom}</div></DetailCard> : null}
      <DetailCard><div className="text-muted-foreground text-xs">Consumption</div><div className="mt-1 text-sm font-semibold tabular-nums">{formatNumber(record.value)} {record.uom}</div></DetailCard>
      <DetailCard><div className="text-muted-foreground text-xs">Variance</div><div className="mt-1"><StatusBadge tone={tone}>{record.varianceFlag ?? "normal"}</StatusBadge></div></DetailCard>
    </div>
  );
}
