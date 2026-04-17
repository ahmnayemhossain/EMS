import type { HazardClass } from "@/types/ems";

export const hazardLabels: Record<HazardClass, string> = {
  corrosive: "Corrosive",
  flammable: "Flammable",
  toxic: "Toxic",
  oxidizer: "Oxidizer",
  irritant: "Irritant",
  environmental_hazard: "Environmental hazard",
  compressed_gas: "Compressed gas",
};

export const chemicalApprovalOptions = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "restricted", label: "Restricted" },
];

