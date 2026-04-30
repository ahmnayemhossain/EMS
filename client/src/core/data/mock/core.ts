import type { Facility, Group, UtilityRecord } from "@/core/types/ems";

export const group: Group = {
  id: "grp_greenstitch",
  name: "EMS Demo Group",
  country: "Local",
  timezone: "Asia/Dhaka",
};

export const facilities: Facility[] = [
  { id: "fac_garments_a", groupId: group.id, name: "Company A", code: "Company A", type: "garments", location: { city: "Region A", region: "Division A", country: "Local" }, riskLevel: "medium", auditReadinessScore: 82, complianceScore: 86 },
  { id: "fac_knitting_b", groupId: group.id, name: "Company B", code: "Company B", type: "knitting", location: { city: "Region B", region: "Division A", country: "Local" }, riskLevel: "medium", auditReadinessScore: 78, complianceScore: 80 },
  { id: "fac_dyeing_d", groupId: group.id, name: "Company C", code: "Company C", type: "dyeing_wet_processing", location: { city: "Region A", region: "Division A", country: "Local" }, riskLevel: "high", auditReadinessScore: 68, complianceScore: 72 },
  { id: "fac_shoe_s", groupId: group.id, name: "Company D", code: "Company D", type: "shoe", location: { city: "Region C", region: "Region C Division", country: "Local" }, riskLevel: "medium", auditReadinessScore: 74, complianceScore: 78 },
  { id: "fac_resort_r", groupId: group.id, name: "Site E", code: "SITE-E", type: "resort", location: { city: "Region D", region: "Region C Division", country: "Local" }, riskLevel: "low", auditReadinessScore: 88, complianceScore: 90 },
  { id: "fac_kadl", groupId: group.id, name: "Company F", code: "Company F", type: "dyeing_wet_processing", location: { city: "Region A", region: "Division A", country: "Local" }, riskLevel: "high", auditReadinessScore: 71, complianceScore: 75 },
  { id: "fac_dt_resort", groupId: group.id, name: "Site G", code: "SITE-G", type: "resort", location: { city: "Region D", region: "Region C Division", country: "Local" }, riskLevel: "low", auditReadinessScore: 90, complianceScore: 92 },
  { id: "fac_rsbl", groupId: group.id, name: "Company H", code: "Company H", type: "garments", location: { city: "Region E", region: "Division A", country: "Local" }, riskLevel: "medium", auditReadinessScore: 76, complianceScore: 79 },
];

export const utilityRecords: UtilityRecord[] = [];

export function getFacilityById(id: string) {
  return facilities.find((facility) => facility.id === id);
}

export function getFacilityName(id: string) {
  return getFacilityById(id)?.name ?? "Unknown company";
}
