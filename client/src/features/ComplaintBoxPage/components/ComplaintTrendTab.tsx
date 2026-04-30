import * as React from "react";

import type { ReportBoxReport } from "@/core/types/ems";
import { complaintCategories } from "@/features/ComplaintBoxPage/constants";

function buildTrendSeries(reports: ReportBoxReport[]) {
  const days: Array<{ date: string; count: number }> = [];
  const start = new Date();
  start.setDate(start.getDate() - 13);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: 0 });
  }

  const byDay = new Map(days.map((d) => [d.date, d.count]));
  for (const r of reports) {
    const key = new Date(r.createdAt).toISOString().slice(0, 10);
    if (!byDay.has(key)) continue;
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }

  return days.map((d) => ({ ...d, count: byDay.get(d.date) || 0 }));
}

export function ComplaintTrendTab({
  reports,
  flaggedCount,
}: {
  reports: ReportBoxReport[];
  flaggedCount: number;
}) {
  const trendSeries = React.useMemo(() => buildTrendSeries(reports), [reports]);

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
        <div className="text-muted-foreground mt-2 text-xs">
          Trend is a placeholder; you can wire real analytics later.
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3 lg:col-span-2">
        <div className="text-sm font-semibold">Last 14 days</div>
        <div className="mt-3 -mx-3 overflow-x-auto px-3">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 gap-2">
              {trendSeries.map((d) => (
                <div key={d.date} className="rounded-lg border bg-muted/10 p-2">
                  <div className="text-muted-foreground text-[10px]">{d.date.slice(5)}</div>
                  <div className="mt-1 text-sm font-semibold tabular-nums">{d.count}</div>
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
            .map((c) => ({
              ...c,
              count: reports.filter((r) => (r.category || "other") === c.value).length,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map((c) => (
              <div key={c.value} className="rounded-lg border bg-muted/10 p-3">
                <div className="text-muted-foreground text-xs">{c.label}</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{c.count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

