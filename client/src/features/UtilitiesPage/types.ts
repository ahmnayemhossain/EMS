import type { UtilityRecord, UtilityType } from "@/core/types/ems";

export type UtilitiesFilters = {
  active: UtilityType;
  search: string;
  facilityId?: string;
};

export type UtilitiesCreateDraft = {
  companyId: string;
  type: UtilityType;
  meterName: string;
  periodStart: string;
  periodEnd: string;
  value: string;
  unit: string;
  min: string;
  remarks: string;
};

export type UtilitiesSelection = UtilityRecord | null;

