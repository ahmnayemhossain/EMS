import type { Dispatch, SetStateAction } from "react";
import type { SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";
import type { UtilityTypeOption } from "@/features/admin/settings/modules/services/uomSettingsApi";

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

export type MasterWiringVm = {
  userId: string;
  loading: boolean;
  search: string;
  wiringSearch: string;
  utilityTypeFilter: string;
  statusFilter: string;
  entityRows: SettingsEntity[];
  wiringRows: WiringRow[];
  utilityTypeOptions: UtilityTypeOption[];
  entityDraft: SettingsEntity;
  wiringDraft: WiringDraft;
  entityEdit: SettingsEntity | null;
  wiringEdit: WiringDraft | null;
  deleteEntityId: string | null;
  deleteWiringId: string | null;
  setSearch: (value: string) => void;
  setWiringSearch: (value: string) => void;
  setUtilityTypeFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setEntityRows: Dispatch<SetStateAction<SettingsEntity[]>>;
  setWiringRows: Dispatch<SetStateAction<WiringRow[]>>;
  setEntityDraft: Dispatch<SetStateAction<SettingsEntity>>;
  setWiringDraft: Dispatch<SetStateAction<WiringDraft>>;
  setEntityEdit: Dispatch<SetStateAction<SettingsEntity | null>>;
  setWiringEdit: Dispatch<SetStateAction<WiringDraft | null>>;
  setDeleteEntityId: (value: string | null) => void;
  setDeleteWiringId: (value: string | null) => void;
  loadAll: () => Promise<void>;
};

