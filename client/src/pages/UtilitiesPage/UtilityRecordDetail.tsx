import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatNumber, formatUtilityType } from "@/utils/format";
import type { UtilityRecord } from "@/types/ems";
import { getFacilityName } from "@/data/mock";

export function UtilityRecordDetail({ record }: { record: UtilityRecord }) {
  const tone =
    record.varianceFlag === "high"
      ? "critical"
      : record.varianceFlag === "watch"
        ? "warning"
        : "compliant";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Factory</div>
          <div className="mt-1 text-sm font-semibold">
            {getFacilityName(record.facilityId)}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">{record.meterName}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Type</div>
          <div className="mt-1 text-sm font-semibold">
            {formatUtilityType(record.type)}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {formatDate(record.periodStart)} → {formatDate(record.periodEnd)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Reading</div>
          <div className="mt-1 text-sm font-semibold tabular-nums">
            {formatNumber(record.value)} {record.uom}
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Variance</div>
          <div className="mt-1">
            <StatusBadge tone={tone}>{record.varianceFlag ?? "normal"}</StatusBadge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">Remarks</div>
        <div className="mt-1 text-sm break-words">{record.remarks ?? "—"}</div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">Bill uploads</div>
        <div className="mt-2 space-y-2 text-sm">
          {record.billFiles?.length ? (
            record.billFiles.map((b) => (
              <div key={b.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0 truncate">{b.name}</div>
                <div className="text-muted-foreground shrink-0 text-xs">
                  {formatDate(b.uploadedAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No files attached.</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">Meter history</div>
        <div className="text-muted-foreground mt-1 text-sm">
          Placeholder for per-meter ledger and variance explanation.
        </div>
      </div>
    </div>
  );
}

