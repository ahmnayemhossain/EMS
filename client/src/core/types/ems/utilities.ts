import type { ID } from "@/core/types/models/ems/core";

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

export type UtilityMasterMeter = UtilityMeterOption & {
  utilityTypeName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  preparedBy?: string;
  updatedBy?: string;
};

export type UtilityRecord = {
  id: number;
  facilityId: ID;
  type: UtilityType;
  meterId?: number;
  meterKey?: string;
  meterCode?: string;
  meterLocation?: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  periodMonth?: string;
  meterName: string;
  dieselLiters?: number;
  calcMethod?: string;
  calcFactor?: number;
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
  monthlyApprovalId?: number;
  approvalStatus?: "pending" | "submitted" | "approved";
  approvedBy?: string;
  approvedAt?: string;
  coverageStart?: string;
  coverageEnd?: string;
  coverageDays?: number;
  monthDays?: number;
  missingRanges?: Array<{ start: string; end: string }>;
  missingDaysCount?: number;
  monthRecordCount?: number;
  monthTotalValue?: number;
  monthTotalDieselLiters?: number;
  monthComplete?: boolean;
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
