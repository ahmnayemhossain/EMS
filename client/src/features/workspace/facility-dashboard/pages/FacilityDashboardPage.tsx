import { PageHeader } from "@/components/layout/primitives/PageHeader";

import { FacilityKpis } from "../components/FacilityKpis";
import { FacilityNotFoundCard } from "../components/FacilityNotFoundCard";
import { FacilityHeaderActions } from "../components/FacilityHeaderActions";
import { FacilitySections } from "../components/FacilitySections";
import { useFacilityDashboard } from "../hooks/use-facility-dashboard";

export function FacilityDashboardPage() {
  const page = useFacilityDashboard();
  if (!page.facility) return <FacilityNotFoundCard />;
  return (
    <div className="space-y-6">
      <PageHeader actions={<FacilityHeaderActions facility={page.facility} />} />
      <FacilityKpis
        water={page.water}
        electricity={page.electricity}
        hazardousChem={page.hazardousChem}
        wasteKg={page.wasteKg}
        openNonCompliance={page.openNonCompliance}
        dueTests={page.dueTests}
      />
      <FacilitySections
        facilityTrend={page.facilityTrend}
        facilityWastewater={page.facilityWastewater}
        facilityIncidents={page.facilityIncidents}
        facilityDocs={page.facilityDocs}
      />
    </div>
  );
}

