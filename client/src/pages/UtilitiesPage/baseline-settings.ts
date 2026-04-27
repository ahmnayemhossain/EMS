import type { UtilityType } from "@/types/ems";

export type UtilityUsageStatus = "normal" | "watch" | "high" | "alert";
export type UtilityUnit = "kWh" | "m3" | "L" | "kg" | "Nm3";

export type UtilityBaselineSetting = {
  facilityId: string;
  utilityType: UtilityType;
  month: string;
  unit: UtilityUnit;
  baselineValue: number;
  minThreshold: number;
  maxThreshold: number;
};

export type UtilityUsagePayload = {
  factoryId: string;
  utilityType: UtilityType;
  periodStart: string;
  periodEnd: string;
  meterName: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unit: UtilityUnit;
  baselineValue?: number;
  minThreshold?: number;
  maxThreshold?: number;
  variance?: number;
  variancePercent?: number;
  status: UtilityUsageStatus;
  remarks?: string;
  attachment?: {
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
};

export function getDefaultUtilityUnit(utilityType: UtilityType): UtilityUnit {
  if (utilityType === "water") return "m3";
  if (utilityType === "fuel") return "L";
  if (utilityType === "steam") return "Nm3";
  if (utilityType === "refrigerant") return "kg";
  return "kWh";
}
