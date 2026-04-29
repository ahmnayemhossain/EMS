import type { SettingsEntity } from "@/pages/settings/modules/settingsEntityApi";
import type { EntityValidationErrors } from "@/pages/settings/modules/entity-manager/types";

export function blankEntity(): SettingsEntity {
  return { id: "", name: "", status: 1 };
}

export function validateEntity(item: SettingsEntity, rows: SettingsEntity[], label: string, currentId?: string) {
  const errors: EntityValidationErrors = {};
  if (!item.name.trim()) errors.name = `${label} name is required`;
  else if (rows.some((row) => row.id !== currentId && row.name.toLowerCase() === item.name.toLowerCase())) errors.name = `${label} name already exists`;
  if (![0, 1].includes(Number(item.status))) errors.status = "Status is required";
  return errors;
}

export function firstEntityError(errors: EntityValidationErrors) {
  return Object.values(errors)[0] ?? null;
}
