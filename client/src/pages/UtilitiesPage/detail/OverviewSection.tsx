import { formatDate, formatUtilityType } from "@/utils/format";
import type { UtilityRecord } from "@/types/ems";
import { DetailCard } from "@/pages/UtilitiesPage/detail/DetailCard";

export function OverviewSection({ record, companyName }: { record: UtilityRecord; companyName: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DetailCard><div className="text-muted-foreground text-xs">Company</div><div className="mt-1 text-sm font-semibold">{companyName}</div><div className="text-muted-foreground mt-1 text-xs">{record.meterName}</div></DetailCard>
      <DetailCard><div className="text-muted-foreground text-xs">Type</div><div className="mt-1 text-sm font-semibold">{formatUtilityType(record.type)}</div><div className="text-muted-foreground mt-1 text-xs">{formatDate(record.periodStart)} → {formatDate(record.periodEnd)}</div>{record.sourceName ? <div className="text-muted-foreground mt-1 text-xs">Source: {record.sourceName}</div> : null}</DetailCard>
    </div>
  );
}
