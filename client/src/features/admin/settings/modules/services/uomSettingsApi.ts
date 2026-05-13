export type { SourceWiringEntity, UomWiringEntity, UtilityTypeOption } from "@/features/admin/settings/modules/wiring-api/types";

import type { SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";
import { listWiring, listWiringLookups, removeWiring, saveWiring } from "@/features/admin/settings/modules/wiring-api/helpers";
import type { SourceWiringEntity, UomWiringEntity, UtilityTypeOption, WiringLookups } from "@/features/admin/settings/modules/wiring-api/types";

export function listUomWiring(userId: string) {
  return listWiring<UomWiringEntity>("uom-wiring", userId, "Could not load UOM wiring.");
}

export async function listUomWiringLookups(userId: string) {
  const data = await listWiringLookups<WiringLookups>("uom-wiring", userId, "Could not load UOM wiring options.");
  return { uomOptions: (data.uomOptions || []) as SettingsEntity[], utilityTypeOptions: data.utilityTypeOptions as UtilityTypeOption[] };
}

export function createUomWiring(item: Pick<UomWiringEntity, "uomId" | "utilityTypeId" | "status">, userId: string) {
  return saveWiring<UomWiringEntity>("uom-wiring", item, userId, "Could not create UOM wiring.");
}

export function updateUomWiring(item: Pick<UomWiringEntity, "id" | "uomId" | "utilityTypeId" | "status">, userId: string) {
  return saveWiring<UomWiringEntity>("uom-wiring", item, userId, "Could not update UOM wiring.", item.id);
}

export function deleteUomWiring(id: string, userId: string) {
  return removeWiring("uom-wiring", id, userId, "Could not delete UOM wiring.");
}

export function listSourceWiring(userId: string) {
  return listWiring<SourceWiringEntity>("source-wiring", userId, "Could not load source wiring.");
}

export async function listSourceWiringLookups(userId: string) {
  const data = await listWiringLookups<WiringLookups>("source-wiring", userId, "Could not load source wiring options.");
  return { sourceOptions: (data.sourceOptions || []) as SettingsEntity[], utilityTypeOptions: data.utilityTypeOptions as UtilityTypeOption[] };
}

export function createSourceWiring(item: Pick<SourceWiringEntity, "sourceId" | "utilityTypeId" | "status">, userId: string) {
  return saveWiring<SourceWiringEntity>("source-wiring", item, userId, "Could not create source wiring.");
}

export function updateSourceWiring(item: Pick<SourceWiringEntity, "id" | "sourceId" | "utilityTypeId" | "status">, userId: string) {
  return saveWiring<SourceWiringEntity>("source-wiring", item, userId, "Could not update source wiring.", item.id);
}

export function deleteSourceWiring(id: string, userId: string) {
  return removeWiring("source-wiring", id, userId, "Could not delete source wiring.");
}

