import type { SettingsEntity } from "@/features/admin/settings/modules/settingsEntityApi";
import type { UtilityTypeOption } from "@/features/admin/settings/modules/uomSettingsApi";

export type WiringDraft = {
  id: string;
  relationId: string;
  utilityTypeId: string;
  status: 0 | 1;
};

export type WiringRow = {
  id: string;
  relationId: string;
  relationName: string;
  utilityTypeId: string;
  utilityTypeKey: string;
  utilityTypeName: string;
  status: 0 | 1;
};

export type MasterWiringConfig = {
  kind: "uom" | "sources";
  singularLabel: string;
  pluralLabel: string;
  relationLabel: string;
  relationPlaceholder: string;
  createSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  createWiringSuccess: string;
  updateWiringSuccess: string;
  deleteWiringSuccess: string;
};

export type MasterWiringApi = {
  listEntities: (userId: string) => Promise<SettingsEntity[]>;
  createEntity: (item: SettingsEntity, userId: string) => Promise<SettingsEntity>;
  updateEntity: (item: SettingsEntity, userId: string) => Promise<SettingsEntity>;
  deleteEntity: (id: string, userId: string) => Promise<{ ok: true }>;
  listWiring: (userId: string) => Promise<WiringRow[]>;
  listLookups: (userId: string) => Promise<{ relationOptions: SettingsEntity[]; utilityTypeOptions: UtilityTypeOption[] }>;
  createWiring: (item: WiringDraft, userId: string) => Promise<WiringRow>;
  updateWiring: (item: WiringDraft, userId: string) => Promise<WiringRow>;
  deleteWiring: (id: string, userId: string) => Promise<{ ok: true }>;
};
