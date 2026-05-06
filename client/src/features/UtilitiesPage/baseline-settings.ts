import type { UtilityType } from "@/core/types/ems";

export type UtilityUsageStatus = "normal" | "watch" | "high" | "alert";
export type UtilityUnit = string;

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
  companyId: string;
  utilityType: UtilityType;
  meterId?: string;
  meterName: string;
  sourceId?: string;
  sourceName?: string;
  periodStart: string;
  periodEnd: string;
  previousReading?: number;
  currentReading?: number;
  consumption: number;
  unit: UtilityUnit;
  baselineValue?: number;
  minThreshold?: number;
  maxThreshold?: number;
  variance?: number;
  variancePercent?: number;
  status: UtilityUsageStatus;
  remarks?: string;
  attachment?: File | null;
};
