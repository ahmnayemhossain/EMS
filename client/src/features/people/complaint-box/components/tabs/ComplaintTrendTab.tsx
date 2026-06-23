import * as React from "react";

import type { ReportBoxReport } from "@/core/types/models/ems";
import { complaintCategories } from "@/features/people/complaint-box/config/constants";

function buildTrendSeries(reports: ReportBoxReport[]) {
  const days: Array<{ date: string; count: number }> = [];
  const start = new Date();
  start.setDate(start.getDate() - 13);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    days.push({ date: key, count: 0 });
  }

  const byDay = new Map(days.map((day) => [day.date, day.count]));
  for (const report of reports) {
    const key = new Date(report.createdAt).toISOString().slice(0, 10);
    if (!byDay.has(key)) continue;
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }

  return days.map((day) => ({ ...day, count: byDay.get(day.date) || 0 }));
}

export function ComplaintTrendTab({
  reports,
  flaggedCount,
}: {
  reports: ReportBoxReport[];
  flaggedCount: number;
}) {
  const trendSeries = React.useMemo(() => buildTrendSeries(reports), [reports]);
  const handledCount = reports.filter((report) => report.status === "handled").length;
  const triagedCount = reports.filter((report) => report.status === "triaged").length;
  const newCount = reports.filter((report) => report.status === "new").length;
  const handledRate = reports.length ? Math.round((handledCount / reports.length) * 100) : 0;
  const peakDay = trendSeries.reduce((best, day) => (day.count > best.count ? day : best), trendSeries[0] ?? { date: "", count: 0 });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border bg-card p-3">
        <div className="text-sm font-semibold">Inbox status</div>
        <div className="text-muted-foreground mt-2 text-sm">
          Total complaints: <span className="font-medium">{reports.length}</span>
        </div>
        <div className="text-muted-foreground mt-1 text-sm">
          Flagged: <span className="font-medium">{flaggedCount}</span>
        </div>
        <div className="text-muted-foreground mt-1 text-sm">
          Resolved: <span className="font-medium">{handledRate}%</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <StatusPill label="New" value={newCount} tone="info" />
          <StatusPill label="Triaged" value={triagedCount} tone="warning" />
          <StatusPill label="Handled" value={handledCount} tone="compliant" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3 lg:col-span-2">
        <div className="text-sm font-semibold">Last 14 days</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Peak day: {peakDay?.date ? `${peakDay.date} (${peakDay.count})` : "No activity"}
        </div>
        <div className="mt-3 -mx-3 overflow-x-auto px-3">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 gap-2">
              {trendSeries.map((day) => (
                <div key={day.date} className="rounded-lg border bg-muted/10 p-2">
                  <div className="text-muted-foreground text-[10px]">{day.date.slice(5)}</div>
                  <div className="mt-1 text-sm font-semibold tabular-nums">{day.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3 lg:col-span-3">
        <div className="text-sm font-semibold">Top categories</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {complaintCategories
            .map((category) => ({
              ...category,
              count: reports.filter((report) => (report.category || "other") === category.value).length,
            }))
            .sort((left, right) => right.count - left.count)
            .slice(0, 6)
            .map((category) => (
              <div key={category.value} className="rounded-lg border bg-muted/10 p-3">
                <div className="text-muted-foreground text-xs">{category.label}</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{category.count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill(props: { label: string; value: number; tone: "info" | "warning" | "compliant" }) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
    warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
    compliant: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  } as const;

  return (
    <div className={`rounded-lg border px-2 py-2 ${tones[props.tone]}`}>
      <div className="text-[11px] font-medium">{props.label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums">{props.value}</div>
    </div>
  );
}
