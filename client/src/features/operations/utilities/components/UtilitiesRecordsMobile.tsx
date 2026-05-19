import { ChevronRight, Droplets, FileText, Gauge } from "lucide-react";

import { cn } from "@/components/ui/primitives/utils";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Badge } from "@/components/ui/primitives/badge";
import type { UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatNumber, formatUtilityType } from "@/core/utils/format";

export function UtilitiesRecordsMobile({
  rows,
  getCompanyName,
  onSelect,
}: {
  rows: UtilityRecord[];
  getCompanyName: (id: string) => string;
  onSelect: (row: UtilityRecord) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold">Utility records</div>
        <div className="text-muted-foreground text-xs">Tap a record to open details.</div>
      </div>
      <div className="overflow-hidden rounded-[20px] border border-border/70 bg-card/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          rows.map((row) => {
            const workflow = getWorkflowStatus(row);

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row)}
                className={cn(
                  "w-full border-b border-border/50 px-4 py-3 text-left transition last:border-b-0",
                  "hover:bg-muted/25 active:bg-muted/35",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold">{row.meterName}</div>
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
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {formatDate(row.periodStart)} → {formatDate(row.periodEnd)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <Gauge className="size-3" />
                        {formatNumber(row.value)} {row.uom}
                      </span>
                      {typeof row.dieselLiters === "number" ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Droplets className="size-3" />
                          {formatNumber(row.dieselLiters)} L
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <FileText className="size-3" />
                        {row.billFiles?.length ? "Bill attached" : "Bill missing"}
                      </span>
                    </div>
                    <StatusBadge tone={workflow.tone} className="rounded-full">
                      {workflow.label}
                    </StatusBadge>
                    {workflow.detail ? (
                      <div className="text-muted-foreground text-[11px]">{workflow.detail}</div>
                    ) : null}
                  </div>

                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
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
    return { tone: "warning" as const, label: "Coverage missing", detail: formatMissingRanges(row.missingRanges) };
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
