import { Building2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/primitives/card";
import type { DashboardWidgetData } from "@/features/overview/dashboard/services/useDashboardWidgetData";

export function CompanySnapshotWidget({
  snapshot,
}: {
  snapshot: DashboardWidgetData["companySnapshot"];
}) {
  return (
    <Card className="h-full border-border/70 shadow-none">
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Company snapshot</div>
            <div className="text-muted-foreground mt-1 text-xs">
              Active company coverage
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-2">
            <Building2 className="size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <div className="text-muted-foreground text-[11px]">Total</div>
            <div className="mt-2 text-lg font-semibold tracking-tight">{snapshot.total}</div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <div className="text-muted-foreground text-[11px]">Active</div>
            <div className="mt-2 text-lg font-semibold tracking-tight">{snapshot.active}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {snapshot.names.length ? (
            snapshot.names.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium"
              >
                {name}
              </span>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No active companies.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
