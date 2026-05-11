import type { FacilityType, UtilityType } from "@/core/types/models/ems";

export function formatFacilityType(type: FacilityType) {
  switch (type) {
    case "garments":
      return "Garments company";
    case "knitting":
      return "Knitting unit";
    case "dyeing_wet_processing":
      return "Dyeing & wet processing";
    case "shoe":
      return "Shoe company";
    case "resort":
      return "Resort";
  }
}

export function formatUtilityType(type: UtilityType) {
  switch (type) {
    case "electricity":
      return "Electricity";
    case "water":
      return "Water";
    case "fuel":
      return "Fuel";
    case "steam":
      return "Steam";
    case "refrigerant":
      return "Refrigerant";
    case "other":
      return "Other";
  }
}

export function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatDate(isoDate: string) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

