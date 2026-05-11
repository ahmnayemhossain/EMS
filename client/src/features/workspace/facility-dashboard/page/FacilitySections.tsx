import { ResponsiveWidgetGroup } from "@/components/layout/primitives/ResponsiveWidgetGroup";

import { facilityTrend } from "../config/constants";
import { FacilityDocumentExpiryCard } from "../components/FacilityDocumentExpiryCard";
import { FacilityRecentIncidentsCard } from "../components/FacilityRecentIncidentsCard";
import { FacilityTrendCard } from "../components/FacilityTrendCard";
import { FacilityWastewaterSummaryCard } from "../components/FacilityWastewaterSummaryCard";

export function FacilitySections(props: { facilityWastewater: any[]; facilityIncidents: any[]; facilityDocs: any[]; }) {
  return <><ResponsiveWidgetGroup desktopClassName="grid gap-4 xl:grid-cols-2" mobileItemClassName="w-[min(92vw,560px)]" items={[{ key: "utilities", node: <FacilityTrendCard title="Utility trend" description="No utility records yet" config={{ water: { label: "Water", color: "var(--chart-2)" }, elec: { label: "Electricity", color: "var(--chart-1)" } }} lines={[{ dataKey: "elec", strokeVar: "var(--color-elec)" }, { dataKey: "water", strokeVar: "var(--color-water)" }]} data={[]} /> }, { key: "waste", node: <FacilityTrendCard title="Waste trend" description="Weekly waste generated" config={{ waste: { label: "Waste", color: "var(--chart-3)" } }} lines={[{ dataKey: "waste", strokeVar: "var(--color-waste)" }]} data={facilityTrend} /> }]} /><ResponsiveWidgetGroup desktopClassName="grid gap-4 xl:grid-cols-3" mobileItemClassName="w-[min(92vw,520px)]" items={[{ key: "wastewater", node: <FacilityWastewaterSummaryCard records={props.facilityWastewater} /> }, { key: "incidents", node: <FacilityRecentIncidentsCard items={props.facilityIncidents} /> }, { key: "docs", node: <FacilityDocumentExpiryCard items={props.facilityDocs} /> }]} /></>;
}

