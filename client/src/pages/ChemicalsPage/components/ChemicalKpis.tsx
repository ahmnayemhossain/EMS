import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { KPIStatCard } from "@/components/KPIStatCard";
import { PageKpiGrid } from "@/components/PageKpiGrid";

export function ChemicalKpis({
  total,
  restricted,
  missingSds,
  nearExpiry,
  hazardousStock,
  nonApproved,
}: {
  total: number;
  restricted: number;
  missingSds: number;
  nearExpiry: number;
  hazardousStock: number;
  nonApproved: number;
}) {
  return (
    <PageKpiGrid>
      <KPIStatCard title="Total chemicals" value={total} tone="info" />
      <KPIStatCard
        title="Restricted chemicals"
        value={restricted}
        helper="Requires substitution / controls"
        tone={restricted > 0 ? "critical" : "compliant"}
      />
      <KPIStatCard
        title="Missing SDS"
        value={missingSds}
        helper="Attach SDS"
        tone={missingSds > 0 ? "warning" : "compliant"}
      />
      <KPIStatCard
        title="Near expiry"
        value={nearExpiry}
        helper="Within 60 days"
        tone={nearExpiry > 0 ? "warning" : "compliant"}
      />
      <KPIStatCard
        title="Hazardous stock"
        value={hazardousStock}
        helper="Multiple hazard classes"
        tone={hazardousStock > 0 ? "info" : "neutral"}
      />
      <KPIStatCard
        title="Non-approved"
        value={nonApproved}
        helper="Pending or restricted"
        tone={nonApproved > 0 ? "warning" : "compliant"}
        icon={ShieldCheck}
      />
    </PageKpiGrid>
  );
}

