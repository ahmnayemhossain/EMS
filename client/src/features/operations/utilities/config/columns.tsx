import { Droplets, FileText, Gauge, Zap } from "lucide-react";

import type { DataColumn } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Badge } from "@/components/ui/primitives/badge";
import type { UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatNumber, formatUtilityType } from "@/core/utils/format";

export function getUtilityColumns(
  getCompanyName: (id: string) => string,
): Array<DataColumn<UtilityRecord>> {
  return [
    {
      id: "primary",
      header: "Utility",
      className: "min-w-[360px]",
      cell: (row) => (
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{row.meterName}</span>
            {row.periodMonth ? (
              <Badge className={getMonthBadgeClass(row.periodMonth)}>
                {formatMonthTag(row.periodMonth)}
              </Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-muted/60 px-2 py-1 font-medium">
              {getCompanyName(row.facilityId)}
            </span>
            <span className="text-muted-foreground">
              {formatUtilityType(row.type)}
              {row.sourceName ? ` • ${row.sourceName}` : ""}
            </span>
            {row.meterLocation ? (
              <span className="text-muted-foreground">{row.meterLocation}</span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "period",
      header: "Cycle",
      className: "min-w-[220px]",
      cell: (row) => (
        <div className="space-y-2 text-sm">
          <div className="font-medium">
            {formatDate(row.periodStart)} → {formatDate(row.periodEnd)}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <StatusBadge tone={row.billFiles?.length ? "compliant" : "warning"} className="rounded-full">
              <FileText className="mr-1 size-3" />
              {row.billFiles?.length ? "Bill attached" : "Bill missing"}
            </StatusBadge>
            {row.monthRecordCount ? (
              <span className="text-muted-foreground">{row.monthRecordCount} entries</span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      className: "min-w-[220px]",
      cell: (row) => (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 font-semibold tabular-nums">
            <Gauge className="size-3.5 text-muted-foreground" />
            {formatNumber(row.value)} {row.uom}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {typeof row.previousReading === "number" || typeof row.currentReading === "number" ? (
              <span className="text-muted-foreground">
                Read: {formatCompactNumber(row.previousReading)} → {formatCompactNumber(row.currentReading)}
              </span>
            ) : null}
            {typeof row.dieselLiters === "number" ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Droplets className="size-3" />
                {formatCompactNumber(row.dieselLiters)} L
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Workflow",
      className: "min-w-[220px]",
      cell: (row) => {
        const { tone, label, detail } = getWorkflowStatus(row);
        return (
          <div className="space-y-2">
            <StatusBadge tone={tone} className="rounded-full px-2.5 py-1">
              {label}
            </StatusBadge>
            {detail ? (
              <div className="text-muted-foreground text-[11px] leading-4">{detail}</div>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "variance",
      header: "Variance",
      className: "min-w-[150px]",
      cell: (row) => {
        const tone =
          row.varianceFlag === "high"
            ? "critical"
            : row.varianceFlag === "watch"
              ? "warning"
              : "compliant";
        return (
          <div className="space-y-2">
            <StatusBadge tone={tone} className="rounded-full">
              <Zap className="mr-1 size-3" />
              {row.varianceFlag ?? "normal"}
            </StatusBadge>
            {typeof row.variancePercent === "number" ? (
              <div className="text-muted-foreground text-[11px]">
                {formatNumber(row.variancePercent)}%
              </div>
            ) : null}
          </div>
        );
      },
    },
  ];
}

function getWorkflowStatus(row: UtilityRecord) {
  if (row.approvalStatus === "approved") {
    return {
      tone: "compliant" as const,
      label: "Approved",
      detail: row.approvedBy ? `Approved by ${row.approvedBy}` : "",
    };
  }
  if (row.approvalStatus === "submitted") {
    return { tone: "info" as const, label: "Pending approval", detail: "Waiting for approver review" };
  }
  if (Number(row.missingDaysCount || 0) > 0) {
    return {
      tone: "warning" as const,
      label: "Coverage missing",
      detail: formatMissingRanges(row.missingRanges),
    };
  }
  if (row.monthComplete) {
    return { tone: "info" as const, label: "Ready to submit", detail: "Full month is covered" };
  }
  return { tone: "neutral" as const, label: "In progress", detail: "Month still incomplete" };
}

function formatMissingRanges(ranges?: Array<{ start: string; end: string }>) {
  if (!ranges?.length) return "";
  return ranges
    .map((range) => {
      const start = range.start.slice(8, 10);
      const end = range.end.slice(8, 10);
      return start === end ? start : `${start}-${end}`;
    })
    .join(", ");
}

function formatMonthTag(periodMonth: string) {
  const [year, month] = periodMonth.split("-");
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(month) - 1;
  return `${shortMonths[monthIndex] || "Mon"} ${String(year || "").slice(-2)}`;
}

function getMonthBadgeClass(periodMonth: string) {
  const monthIndex = Math.max(0, Math.min(11, Number(periodMonth.slice(5, 7)) - 1));
  const classes = [
    "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300",
    "border-orange-500/30 bg-orange-500/12 text-orange-700 dark:text-orange-300",
    "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
    "border-lime-500/30 bg-lime-500/12 text-lime-700 dark:text-lime-300",
    "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    "border-teal-500/30 bg-teal-500/12 text-teal-700 dark:text-teal-300",
    "border-cyan-500/30 bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    "border-sky-500/30 bg-sky-500/12 text-sky-700 dark:text-sky-300",
    "border-blue-500/30 bg-blue-500/12 text-blue-700 dark:text-blue-300",
    "border-indigo-500/30 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
    "border-violet-500/30 bg-violet-500/12 text-violet-700 dark:text-violet-300",
    "border-fuchsia-500/30 bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300",
  ];
  return classes[monthIndex];
}

function formatCompactNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return formatNumber(value);
}
