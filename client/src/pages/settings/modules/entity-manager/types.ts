import type { SettingsEntity, SettingsEntityKind } from "@/pages/settings/modules/settingsEntityApi";

export type EntityManagerConfig = {
  kind: SettingsEntityKind;
  title: string;
  noun: string;
  description: string;
};

export type EntityValidationErrors = Partial<Record<"name" | "status", string>>;
export type EntityRow = SettingsEntity;
