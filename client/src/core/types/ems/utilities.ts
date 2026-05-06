import type { ID } from "@/core/types/ems/core";

export type UtilityType =
  | "electricity"
  | "water"
  | "fuel"
  | "steam"
  | "refrigerant"
  | "other";

export type UtilityUomOption = {
  id: string;
  name: string;
  utilityType: UtilityType;
};

export type UtilitySourceOption = {
  id: string;
  name: string;
  utilityType: UtilityType;
};

export type UtilityMeterOption = {
  id: string;
  name: string;
  code?: string;
  location?: string;
  utilityType: UtilityType;
  sourceId?: ID;
  sourceName?: string;
  uom: string;
};

export type UtilityRecord = {
  id: number;
  facilityId: ID;
  type: UtilityType;
  meterId?: number;
  meterCode?: string;
  meterLocation?: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  meterName: string;
  sourceId?: ID;
  sourceName?: string;
  previousReading?: number;
  currentReading?: number;
  uom: string;
  value: number;
  baselineValue?: number;
  minThreshold?: number;
  maxThreshold?: number;
  variance?: number;
  variancePercent?: number;
  varianceFlag?: "normal" | "watch" | "high";
  status?: "normal" | "watch" | "high" | "alert";
  remarks?: string;
  billFiles?: Array<{
    id?: number;
    name: string;
    storedName?: string;
    mimeType?: string;
    fileSize?: number;
    storagePath?: string;
    url?: string;
    uploadedAt: string;
  }>;
  createdByUserId?: ID;
  updatedByUserId?: ID;
};
