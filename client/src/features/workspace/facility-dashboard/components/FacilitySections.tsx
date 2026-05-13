import { FacilityDocumentExpiryCard } from "./FacilityDocumentExpiryCard";
import { FacilityRecentIncidentsCard } from "./FacilityRecentIncidentsCard";
import { FacilityTrendCard } from "./FacilityTrendCard";
import { FacilityWastewaterSummaryCard } from "./FacilityWastewaterSummaryCard";

export function FacilitySections(props: {
  facilityTrend: Array<Record<string, unknown>>;
  facilityWastewater: any[];
  facilityIncidents: any[];
  facilityDocs: any[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <FacilityTrendCard
        title="Monthly utility trend"
        description="Current facility utility and waste pattern by week."
        config={{
          water: { label: "Water", color: "hsl(var(--chart-2))" },
          elec: { label: "Electricity", color: "hsl(var(--chart-1))" },
          waste: { label: "Waste", color: "hsl(var(--chart-5))" },
        }}
        lines={[
          { dataKey: "water", strokeVar: "var(--color-water)" },
          { dataKey: "elec", strokeVar: "var(--color-elec)" },
          { dataKey: "waste", strokeVar: "var(--color-waste)" },
        ]}
        data={props.facilityTrend}
      />
      <FacilityWastewaterSummaryCard records={props.facilityWastewater} />
      <FacilityRecentIncidentsCard items={props.facilityIncidents} />
      <FacilityDocumentExpiryCard items={props.facilityDocs} />
    </div>
  );
}
