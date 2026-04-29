import type { SettingsEntity } from "@/pages/settings/modules/settingsEntityApi";

export type UtilityTypeOption = {
  id: string;
  key: string;
  name: string;
};

export type UomWiringEntity = {
  id: string;
  uomId: string;
  uomName: string;
  utilityTypeId: string;
  utilityTypeKey: string;
  utilityTypeName: string;
  status: 0 | 1;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SourceWiringEntity = {
  id: string;
  sourceId: string;
  sourceName: string;
  utilityTypeId: string;
  utilityTypeKey: string;
  utilityTypeName: string;
  status: 0 | 1;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WiringLookups = {
  uomOptions?: SettingsEntity[];
  sourceOptions?: SettingsEntity[];
  utilityTypeOptions: UtilityTypeOption[];
};
