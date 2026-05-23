import { Receipt, TrendingUp, Zap } from "lucide-react";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/primitives/card";
import { formatNumber } from "@/core/utils/format";
import type { DashboardWidgetData } from "@/features/overview/dashboard/services/useDashboardWidgetData";

export function UtilityOverviewWidget({
  overview,
}: {
  overview: DashboardWidgetData["utilityOverview"];
}) {
  return (
    <Card className="h-full border-border/70 shadow-none">
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div>
          <div className="text-sm font-semibold">Utility overview</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {overview.latestMonthLabel}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3">
          <WidgetMetric
            icon={<Zap className="size-3.5" />}
            label="Total"
            value={formatNumber(overview.totalConsumption)}
          />
          <WidgetMetric
            icon={<Receipt className="size-3.5" />}
            label="Records"
            value={String(overview.recordCount)}
          />
          <WidgetMetric
            icon={<Receipt className="size-3.5" />}
            label="Missing bills"
            value={String(overview.missingBillsCount)}
          />
          <WidgetMetric
            icon={<TrendingUp className="size-3.5" />}
            label="High variance"
            value={String(overview.highVarianceCount)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 p-3">
      <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}
