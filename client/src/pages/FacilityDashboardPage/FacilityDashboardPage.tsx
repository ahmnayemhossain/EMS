import { PageHeader } from "@/components/PageHeader";

import { FacilityKpis } from "./components/FacilityKpis";
import { FacilityNotFoundCard } from "./components/FacilityNotFoundCard";
import { FacilityHeaderActions } from "./page/FacilityHeaderActions";
import { FacilitySections } from "./page/FacilitySections";
import { useFacilityDashboard } from "./page/use-facility-dashboard";

export function FacilityDashboardPage() {
  const page = useFacilityDashboard();
  if (!page.facility) return <FacilityNotFoundCard />;
  return <div className="space-y-6"><PageHeader actions={<FacilityHeaderActions facility={page.facility} />} /><FacilityKpis water={page.water} electricity={page.electricity} hazardousChem={page.hazardousChem} wasteKg={page.wasteKg} openNonCompliance={page.openNonCompliance} dueTests={page.dueTests} /><FacilitySections facilityWastewater={page.facilityWastewater} facilityIncidents={page.facilityIncidents} facilityDocs={page.facilityDocs} /></div>;
}
