import * as React from "react";

import { Card, CardContent } from "@/components/ui/primitives/card";
import type { DashboardWidgetData } from "@/features/overview/dashboard/services/useDashboardWidgetData";

export function UtilityApprovalQueueWidget({
  queue,
}: {
  queue: DashboardWidgetData["utilityApprovalQueue"];
}) {
  const items = [
    { label: "Draft", value: queue.draft, tone: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950" },
    { label: "Pending", value: queue.pending, tone: "bg-amber-500 text-white" },
    { label: "Approved", value: queue.approved, tone: "bg-emerald-600 text-white" },
    { label: "Audited", value: queue.audited, tone: "bg-sky-600 text-white" },
  ];

  return (
    <Card className="h-full border-border/70 shadow-none">
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div>
          <div className="text-sm font-semibold">Utility approval queue</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Meter-month workflow counts
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border/70 bg-background/80 p-3">
              <div className="text-muted-foreground text-[11px]">{item.label}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-lg font-semibold tracking-tight">{item.value}</div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${item.tone}`}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
