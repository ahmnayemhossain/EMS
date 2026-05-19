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

export type UtilityMasterMeter = UtilityMeterOption & {
  utilityTypeName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  preparedBy?: string;
  updatedBy?: string;
};

export type UtilityApprovalStep = {
  key: string;
  name: string;
  sortOrder: number;
  isInitial: boolean;
  isFinal: boolean;
  isActive: boolean;
};

export type UtilityApprovalTransition = {
  key: string;
  name: string;
  fromStepKey: string;
  toStepKey: string;
  isActive: boolean;
};

export type UtilityApprovalFlow = {
  group: {
    key: string;
    name: string;
    moduleKey: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
  } | null;
  steps: UtilityApprovalStep[];
  transitions: UtilityApprovalTransition[];
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
  approvalStatus?: string;
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

