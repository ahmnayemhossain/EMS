import type { ID } from "@/types/ems/core";

export type UtilityType =
  | "electricity"
  | "water"
  | "fuel"
  | "steam"
  | "refrigerant"
  | "other";

export type UtilityRecord = {
  id: ID;
  facilityId: ID;
  type: UtilityType;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  meterName: string;
  uom: "kWh" | "m3" | "L" | "kg" | "Nm3";
  value: number;
  baselineValue?: number;
  varianceFlag?: "normal" | "watch" | "high";
  remarks?: string;
  billFiles?: Array<{ name: string; uploadedAt: string }>;
};

