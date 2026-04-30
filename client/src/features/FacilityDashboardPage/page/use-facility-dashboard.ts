import { useParams } from "react-router";

import { capas, chemicals, documents, getFacilityById, incidents, utilityRecords, wastewaterRecords, wasteRecords } from "@/core/data/mock";
import { formatNumber } from "@/core/utils/format";

export function useFacilityDashboard() {
  const { id } = useParams();
  const facility = id ? getFacilityById(id) : undefined;
  if (!facility) return { facility: null };
  const facilityUtilities = utilityRecords.filter((item) => item.facilityId === facility.id);
  const facilityChemicals = chemicals.filter((item) => item.facilityId === facility.id);
  const facilityWaste = wasteRecords.filter((item) => item.facilityId === facility.id);
  const facilityWastewater = wastewaterRecords.filter((item) => item.facilityId === facility.id);
  const facilityCapas = capas.filter((item) => item.facilityId === facility.id);
  const facilityDocs = documents.filter((item) => item.facilityId === facility.id);
  const facilityIncidents = incidents.filter((item) => item.facilityId === facility.id);
  return { facility, facilityWastewater, facilityDocs, facilityIncidents, water: `${formatNumber(facilityUtilities.find((item) => item.type === "water")?.value ?? 0)} m³`, electricity: `${formatNumber(facilityUtilities.find((item) => item.type === "electricity")?.value ?? 0)} kWh`, hazardousChem: facilityChemicals.filter((item) => item.approvalStatus !== "approved").length, wasteKg: `${formatNumber(facilityWaste.reduce((sum, item) => sum + item.qtyKg, 0))} kg`, openNonCompliance: facilityCapas.filter((item) => item.status !== "closed").length, dueTests: facilityWastewater.some((item) => item.exceedance?.length) ? 1 : 0 };
}
