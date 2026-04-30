import * as React from "react";
import { Droplets } from "lucide-react";

import { KPIStatCard } from "@/core/components/KPIStatCard";
import { PageKpiGrid } from "@/core/components/PageKpiGrid";
import type { StatusTone } from "@/core/components/StatusBadge";

export function WastewaterKpis({
  inflow,
  outflow,
  latestPh,
  latestCod,
  latestBod,
  exceedanceCount,
}: {
  inflow: string;
  outflow: string;
  latestPh: React.ReactNode;
  latestCod: React.ReactNode;
  latestBod: React.ReactNode;
  exceedanceCount: number;
}) {
  const exceedanceTone: StatusTone =
    exceedanceCount > 0 ? "critical" : "compliant";

  return (
    <PageKpiGrid>
      <KPIStatCard title="Inflow" value={inflow} helper="Add inflow meter later" icon={Droplets} />
      <KPIStatCard title="Outflow" value={outflow} helper="Add outflow meter later" icon={Droplets} />
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

