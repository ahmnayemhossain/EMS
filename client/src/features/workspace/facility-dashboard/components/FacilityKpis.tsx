import * as React from "react";
import { Droplets, Zap } from "lucide-react";

import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";

export function FacilityKpis({
  water,
  electricity,
  hazardousChem,
  wasteKg,
  openNonCompliance,
  dueTests,
}: {
  water: string;
  electricity: string;
  hazardousChem: number;
  wasteKg: string;
  openNonCompliance: number;
  dueTests: number;
}) {
  return (
    <PageKpiGrid>
      <KPIStatCard title="Water consumption" value={water} icon={Droplets} />
      <KPIStatCard title="Electricity consumption" value={electricity} icon={Zap} />
      <KPIStatCard
        title="Chemical stock risk"
        value={hazardousChem}
        helper="Restricted/pending chemicals"
      />
      <KPIStatCard
        title="Waste generated"
        value={wasteKg}
        helper="Last logged period"
      />
      <KPIStatCard
        title="Open non-compliance"
        value={openNonCompliance}
        helper="Open/In progress/Overdue CAPA"
      />
      <KPIStatCard
        title="Due monitoring tests"
        value={dueTests}
        helper="Based on last lab schedule"
      />
    </PageKpiGrid>
  );
}


