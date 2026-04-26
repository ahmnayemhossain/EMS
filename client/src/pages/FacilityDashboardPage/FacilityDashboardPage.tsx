import * as React from "react";
import { useParams } from "react-router";

import { AuditScorePanel } from "@/components/AuditScorePanel";
import { PageHeader } from "@/components/PageHeader";
import { ResponsiveWidgetGroup } from "@/components/ResponsiveWidgetGroup";
import { RiskBadge } from "@/components/RiskBadge";
import {
  capas,
  chemicals,
  documents,
  getFacilityById,
  incidents,
  utilityRecords,
  wastewaterRecords,
  wasteRecords,
} from "@/data/mock";
import { formatNumber } from "@/utils/format";

import { facilityTrend } from "./constants";
import { FacilityDocumentExpiryCard } from "./components/FacilityDocumentExpiryCard";
import { FacilityKpis } from "./components/FacilityKpis";
import { FacilityNotFoundCard } from "./components/FacilityNotFoundCard";
import { FacilityRecentIncidentsCard } from "./components/FacilityRecentIncidentsCard";
import { FacilityTrendCard } from "./components/FacilityTrendCard";
import { FacilityWastewaterSummaryCard } from "./components/FacilityWastewaterSummaryCard";

export function FacilityDashboardPage() {
  const { id } = useParams();
  const facility = id ? getFacilityById(id) : undefined;

  if (!facility) return <FacilityNotFoundCard />;

  const facilityUtilities = utilityRecords.filter((u) => u.facilityId === facility.id);
  const facilityChemicals = chemicals.filter((c) => c.facilityId === facility.id);
  const facilityWaste = wasteRecords.filter((w) => w.facilityId === facility.id);
  const facilityWastewater = wastewaterRecords.filter((w) => w.facilityId === facility.id);
  const facilityCapas = capas.filter((c) => c.facilityId === facility.id);
  const facilityDocs = documents.filter((d) => d.facilityId === facility.id);
  const facilityIncidents = incidents.filter((i) => i.facilityId === facility.id);

  const water = facilityUtilities.find((u) => u.type === "water")?.value ?? 0;
  const electricity = facilityUtilities.find((u) => u.type === "electricity")?.value ?? 0;
  const hazardousChem = facilityChemicals.filter((c) => c.approvalStatus !== "approved").length;
  const wasteKg = facilityWaste.reduce((sum, w) => sum + w.qtyKg, 0);
  const openNonCompliance = facilityCapas.filter((c) => c.status !== "closed").length;
  const dueTests = facilityWastewater.some((r) => r.exceedance?.length) ? 1 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <RiskBadge level={facility.riskLevel} />
            <AuditScorePanel score={facility.auditReadinessScore} />
          </div>
        }
      />

      <FacilityKpis
        water={`${formatNumber(water)} m\u00B3`}
        electricity={`${formatNumber(electricity)} kWh`}
        hazardousChem={hazardousChem}
        wasteKg={`${formatNumber(wasteKg)} kg`}
        openNonCompliance={openNonCompliance}
        dueTests={dueTests}
      />

      <ResponsiveWidgetGroup
        desktopClassName="grid gap-4 xl:grid-cols-2"
        mobileItemClassName="w-[min(92vw,560px)]"
        items={[
          {
            key: "utilities",
            node: (
              <FacilityTrendCard
                title="Utility trend"
                description="Weekly trend (mock)"
                config={{
                  water: { label: "Water", color: "var(--chart-2)" },
                  elec: { label: "Electricity", color: "var(--chart-1)" },
                }}
                lines={[
                  { dataKey: "elec", strokeVar: "var(--color-elec)" },
                  { dataKey: "water", strokeVar: "var(--color-water)" },
                ]}
                data={facilityTrend}
              />
            ),
          },
          {
            key: "waste",
            node: (
              <FacilityTrendCard
                title="Waste trend"
                description="Weekly waste generated (mock)"
                config={{ waste: { label: "Waste", color: "var(--chart-3)" } }}
                lines={[{ dataKey: "waste", strokeVar: "var(--color-waste)" }]}
                data={facilityTrend}
              />
            ),
          },
        ]}
      />

      <ResponsiveWidgetGroup
        desktopClassName="grid gap-4 xl:grid-cols-3"
        mobileItemClassName="w-[min(92vw,520px)]"
        items={[
          {
            key: "wastewater",
            node: <FacilityWastewaterSummaryCard records={facilityWastewater} />,
          },
          {
            key: "incidents",
            node: <FacilityRecentIncidentsCard items={facilityIncidents} />,
          },
          {
            key: "docs",
            node: <FacilityDocumentExpiryCard items={facilityDocs} />,
          },
        ]}
      />
    </div>
  );
}
