import type { ID } from "@/types/ems/core";

export type UtilityType =
  | "electricity"
  | "water"
  | "fuel"
  | "steam"
  | "refrigerant"
  | "other";

export type UtilityRecord = {
  id: number;
  facilityId: ID;
  type: UtilityType;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  meterName: string;
  previousReading?: number;
  currentReading?: number;
  uom: "kWh" | "m3" | "L" | "kg" | "Nm3";
  value: number;
  baselineValue?: number;
  minThreshold?: number;
  maxThreshold?: number;
  variance?: number;
  variancePercent?: number;
  varianceFlag?: "normal" | "watch" | "high";
  status?: "normal" | "watch" | "high" | "alert";
  remarks?: string;
  billFiles?: Array<{ name: string; uploadedAt: string }>;
  createdByUserId?: ID;
  updatedByUserId?: ID;
};
