import type { DataColumn } from "@/core/components/DataTable";
import type { UtilityRecord } from "@/core/types/ems";

import { Button } from "@/core/app/components/ui/button";
import { Badge } from "@/core/app/components/ui/badge";
import { StatusBadge } from "@/core/components/StatusBadge";
import { formatDate, formatNumber, formatUtilityType } from "@/core/utils/format";

export function getUtilityColumns(getCompanyName: (id: string) => string): Array<DataColumn<UtilityRecord>> {
  return [
    {
      id: "company",
      header: "Company",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{getCompanyName(row.facilityId)}</div>
          <div className="text-muted-foreground mt-1 text-xs">{row.meterName}</div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "period",
      header: "Period",
      cell: (row) => (
        <div className="text-sm">
          <div>
            {formatDate(row.periodStart)} → {formatDate(row.periodEnd)}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              {formatUtilityType(row.type)}
              {row.sourceName ? ` • ${row.sourceName}` : ""}
            </span>
            {row.periodMonth ? (
              <Badge className={getMonthBadgeClass(row.periodMonth)}>
                {formatMonthTag(row.periodMonth)}
              </Badge>
            ) : null}
          </div>
        </div>
      ),
      className: "min-w-[220px]",
    },
    {
      id: "value",
      header: "Reading",
      cell: (row) => (
        <div className="text-right font-medium tabular-nums">
          {formatNumber(row.value)} {row.uom}
        </div>
      ),
      className: "text-right min-w-[160px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const { tone, label } = getWorkflowStatus(row);
        return (
          <div className="flex justify-end">
            <StatusBadge tone={tone}>{label}</StatusBadge>
          </div>
        );
      },
      className: "text-right min-w-[140px]",
    },
    {
      id: "variance",
      header: "Variance",
      cell: (row) => {
        const tone =
          row.varianceFlag === "high"
            ? "critical"
            : row.varianceFlag === "watch"
              ? "warning"
              : "compliant";
        return (
          <div className="flex justify-end">
            <StatusBadge tone={tone}>{row.varianceFlag ?? "normal"}</StatusBadge>
          </div>
        );
      },
      className: "text-right min-w-[140px]",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button variant="outline" size="sm">
            View
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];
}

function getWorkflowStatus(row: UtilityRecord) {
  if (row.approvalStatus === "approved") {
    return { tone: "compliant" as const, label: "Approved" };
  }
  if (row.approvalStatus === "submitted") {
    return { tone: "info" as const, label: "Pending approval" };
  }
  if (Number(row.missingDaysCount || 0) > 0) {
    return { tone: "warning" as const, label: "Missing" };
  }
  if (row.monthComplete) {
    return { tone: "info" as const, label: "Ready to submit" };
  }
  return { tone: "neutral" as const, label: "In progress" };
}

function formatMonthTag(periodMonth: string) {
  const [year, month] = periodMonth.split("-");
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(month) - 1;
  const shortYear = String(year || "").slice(-2);
  return `${shortMonths[monthIndex] || "Mon"} ${shortYear}`;
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
