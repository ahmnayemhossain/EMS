import * as React from "react";
import { CalendarClock, Recycle } from "lucide-react";

import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";

export function WasteKpis({
  rowsCount,
  totalKgLabel,
  hazardousBacklog,
  dueSoon,
}: {
  rowsCount: number;
  totalKgLabel: string;
  hazardousBacklog: number;
  dueSoon: number;
}) {
  return (
    <PageKpiGrid columnsClassName="sm:grid-cols-2 xl:grid-cols-4">
      <KPIStatCard title="Waste logged" value={rowsCount} icon={Recycle} tone="info" />
      <KPIStatCard title="Total quantity" value={totalKgLabel} tone="info" />
      <KPIStatCard
        title="Hazardous backlog"
        value={hazardousBacklog}
        helper="Not disposed yet"
        tone={hazardousBacklog > 0 ? "warning" : "compliant"}
      />
      <KPIStatCard
        title="Due soon"
        value={dueSoon}
        helper="Before Apr 15, 2026 (mock)"
        icon={CalendarClock}
        tone={dueSoon > 0 ? "warning" : "compliant"}
      />
    </PageKpiGrid>
  );
}


