import { useMemo } from "react";
import { useParams } from "react-router";

import { capas, chemicals, documents, getFacilityById, incidents, utilityRecords, wastewaterRecords, wasteRecords } from "@/core/data/catalog/mock";
import { formatNumber } from "@/core/utils/format";

export function useFacilityDashboard() {
  const params = useParams<{ id: string }>();
  const facilityId = String(params.id || "");

  return useMemo(() => {
    const facility = getFacilityById(facilityId) ?? null;
    if (!facility) {
      return {
        facility: null,
        water: "0 mÃ‚Â³",
        electricity: "0 kWh",
        hazardousChem: 0,
        wasteKg: "0 kg",
        openNonCompliance: 0,
        dueTests: 0,
        facilityWastewater: [],
        facilityIncidents: [],
        facilityDocs: [],
        facilityTrend: [],
      };
    }

    const facilityUtilities = utilityRecords.filter((record) => String(record.facilityId) === facilityId);
    const facilityWastewater = wastewaterRecords.filter((record) => String(record.facilityId) === facilityId);
    const facilityIncidents = incidents.filter((record) => String(record.facilityId) === facilityId);
    const facilityDocs = documents.filter((record) => String(record.facilityId) === facilityId);
    const facilityWaste = wasteRecords.filter((record) => String(record.facilityId) === facilityId);
    const facilityChemicals = chemicals.filter((record) => String(record.facilityId) === facilityId);
    const facilityCapas = capas.filter((record) => String(record.facilityId) === facilityId);

    const water = facilityUtilities.filter((record) => record.type === "water").reduce((sum, record) => sum + Number(record.value || 0), 0);
    const electricity = facilityUtilities.filter((record) => record.type === "electricity").reduce((sum, record) => sum + Number(record.value || 0), 0);
    const wasteKg = facilityWaste.reduce((sum, record) => sum + Number(record.qtyKg || 0), 0);
    const hazardousChem = facilityChemicals.filter((record) => (record.hazardClasses?.length ?? 0) > 0).length;
    const openNonCompliance = facilityCapas.filter((record) => record.status !== "closed").length;
    const dueTests = facilityWastewater.filter((record) => (record.exceedance?.length ?? 0) > 0).length;

    const facilityTrend = [
      { week: "W1", water: Math.round(water * 0.23), elec: Math.round(electricity * 0.24), waste: Math.round(wasteKg * 0.23) },
      { week: "W2", water: Math.round(water * 0.25), elec: Math.round(electricity * 0.25), waste: Math.round(wasteKg * 0.24) },
      { week: "W3", water: Math.round(water * 0.24), elec: Math.round(electricity * 0.23), waste: Math.round(wasteKg * 0.25) },
      { week: "W4", water: Math.round(water * 0.28), elec: Math.round(electricity * 0.28), waste: Math.round(wasteKg * 0.28) },
    ];

    return {
      facility,
      water: `${formatNumber(water)} mÃ‚Â³`,
      electricity: `${formatNumber(electricity)} kWh`,
      hazardousChem,
      wasteKg: `${formatNumber(wasteKg)} kg`,
      openNonCompliance,
      dueTests,
      facilityWastewater,
      facilityIncidents,
      facilityDocs,
      facilityTrend,
    };
  }, [facilityId]);
}
