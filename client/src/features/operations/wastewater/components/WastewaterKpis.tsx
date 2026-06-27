import * as React from "react";
import { Droplets } from "lucide-react";

import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";
import type { StatusTone } from "@/components/feedback/StatusBadge";

export function WastewaterKpis({
  totalSamples,
  outletSamples,
  latestPh,
  latestCod,
  latestBod,
  exceedanceCount,
}: {
  totalSamples: number;
  outletSamples: number;
  latestPh: React.ReactNode;
  latestCod: React.ReactNode;
  latestBod: React.ReactNode;
  exceedanceCount: number;
}) {
  const exceedanceTone: StatusTone = exceedanceCount > 0 ? "critical" : "compliant";

  return (
    <PageKpiGrid columnsClassName="sm:grid-cols-2 xl:grid-cols-3">
      <KPIStatCard title="Samples logged" value={totalSamples} helper="Inlet and outlet" icon={Droplets} />
      <KPIStatCard title="Outlet samples" value={outletSamples} helper="Current visible records" icon={Droplets} />
      <KPIStatCard title="Latest pH" value={latestPh} />
      <KPIStatCard title="Latest COD" value={latestCod} helper="Outlet sample" />
      <KPIStatCard title="Latest BOD" value={latestBod} helper="Outlet sample" />
      <KPIStatCard
        title="Exceedance count"
        value={exceedanceCount}
        helper="Records flagged"
        tone={exceedanceTone}
      />
    </PageKpiGrid>
  );
}
