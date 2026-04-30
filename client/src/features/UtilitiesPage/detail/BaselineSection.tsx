import { DetailCard } from "@/features/UtilitiesPage/detail/DetailCard";
import type { UtilityRecord } from "@/core/types/ems";
import { formatNumber } from "@/core/utils/format";

export function BaselineSection({ record }: { record: UtilityRecord }) {
  if (typeof record.baselineValue !== "number") return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <DetailCard><div className="text-muted-foreground text-xs">Baseline Usage</div><div className="mt-1 text-sm font-semibold tabular-nums">{formatNumber(record.baselineValue)} {record.uom}</div></DetailCard>
      <DetailCard><div className="text-muted-foreground text-xs">Variance</div><div className="mt-1 text-sm font-semibold tabular-nums">{typeof record.variance === "number" ? formatNumber(record.variance) : "—"} {record.uom}</div></DetailCard>
      <DetailCard><div className="text-muted-foreground text-xs">Variance %</div><div className="mt-1 text-sm font-semibold tabular-nums">{typeof record.variancePercent === "number" ? `${record.variancePercent.toFixed(1)}%` : "—"}</div></DetailCard>
    </div>
  );
}
