import type { SettingsEntity, SettingsEntityKind } from "@/features/admin/settings/modules/services/settingsEntityApi";

export type EntityManagerConfig = {
  kind: SettingsEntityKind;
  title: string;
  noun: string;
  description: string;
};

export type EntityValidationErrors = Partial<Record<"name" | "status", string>>;
export type EntityRow = SettingsEntity;

