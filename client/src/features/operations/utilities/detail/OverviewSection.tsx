import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDate, formatUtilityType } from "@/core/utils/format";
import type { UtilityRecord } from "@/core/types/models/ems";
import { DetailCard } from "@/features/operations/utilities/detail/DetailCard";

export function OverviewSection({ record, companyName }: { record: UtilityRecord; companyName: string }) {
  const approvalTone =
    record.approvalStatus === "approved"
      ? "compliant"
      : record.approvalStatus === "submitted"
        ? "info"
      : Number(record.missingDaysCount || 0) > 0
        ? "warning"
        : "info";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DetailCard>
        <div className="text-muted-foreground text-xs">Company</div>
        <div className="mt-1 text-sm font-semibold">{companyName}</div>
        <div className="text-muted-foreground mt-1 text-xs">{record.meterName}</div>
      </DetailCard>
      <DetailCard>
        <div className="text-muted-foreground text-xs">Type</div>
        <div className="mt-1 text-sm font-semibold">{formatUtilityType(record.type)}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {formatDate(record.periodStart)} Ã¢â€ â€™ {formatDate(record.periodEnd)}
        </div>
        {record.sourceName ? (
          <div className="text-muted-foreground mt-1 text-xs">Source: {record.sourceName}</div>
        ) : null}
      </DetailCard>
      <DetailCard>
        <div className="text-muted-foreground text-xs">Month approval</div>
        <div className="mt-1">
          <StatusBadge tone={approvalTone}>
            {record.approvalStatus === "approved"
              ? "approved"
              : record.approvalStatus === "submitted"
                ? "submitted"
                : "pending"}
          </StatusBadge>
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          {record.periodMonth ? formatDate(record.periodMonth) : "--"} month
        </div>
        {record.approvedBy ? (
          <div className="text-muted-foreground mt-1 text-xs">Approver: {record.approvedBy}</div>
        ) : null}
      </DetailCard>
      <DetailCard>
        <div className="text-muted-foreground text-xs">Coverage</div>
        <div className="mt-1 text-sm font-semibold">
          {typeof record.coverageDays === "number" && typeof record.monthDays === "number"
            ? `${record.coverageDays}/${record.monthDays} day(s)`
            : "--"}
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          {Number(record.missingDaysCount || 0) > 0
            ? `${record.missingDaysCount} day(s) missing before approval`
            : "Full month covered"}
        </div>
      </DetailCard>
    </div>
  );
}

