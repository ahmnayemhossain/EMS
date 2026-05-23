import type { RoleScope } from "@/core/types/models/admin";
import { createSystemHeaders, parseSystemResponse, SYSTEM_API } from "@/features/admin/settings/modules/api/system-api";

export type SettingsEntity = {
  id: string;
  name: string;
  status: 0 | 1;
  utilityType?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RoleEntity = SettingsEntity & {
  scope: RoleScope;
  description?: string;
  permissionKeys: string[];
};

export type PermissionOption = {
  key: string;
  label: string;
  group?: string;
  action?: string;
};

export async function listRoles(userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles`, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<RoleEntity[]>(response, "Could not load roles.");
}

export async function listRoleLookups() {
  const response = await fetch(`${SYSTEM_API}/roles/lookups/options`, { cache: "no-store" });
  return parseSystemResponse<{ permissions: PermissionOption[] }>(
    response,
    "Could not load role options.",
  );
}

export async function createRole(role: RoleEntity, userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles`, {
    method: "POST",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(role),
  });
  return parseSystemResponse<RoleEntity>(response, "Role create failed.");
}

export async function updateRole(role: RoleEntity, userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles/${role.id}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(role),
  });
  return parseSystemResponse<RoleEntity>(response, "Role save failed.");
}

export async function deleteRole(id: string, userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles/${id}`, {
    method: "DELETE",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<{ ok: true }>(response, "Role delete failed.");
}

export type SettingsEntityKind = "departments" | "designations" | "uom" | "sources" | "suppliers";

function settingsEntityPath(kind: SettingsEntityKind) {
  return `${SYSTEM_API}/${kind.replaceAll("_", "-")}`;
}

export async function listSettingsEntities(kind: SettingsEntityKind, userId: string) {
  const response = await fetch(settingsEntityPath(kind), { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<SettingsEntity[]>(response, "Could not load records.");
}

export async function createSettingsEntity(kind: SettingsEntityKind, item: SettingsEntity, userId: string) {
  const response = await fetch(settingsEntityPath(kind), {
    method: "POST",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(item),
  });
  return parseSystemResponse<SettingsEntity>(response, "Create failed.");
}

export async function updateSettingsEntity(kind: SettingsEntityKind, item: SettingsEntity, userId: string) {
  const response = await fetch(`${settingsEntityPath(kind)}/${item.id}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(item),
  });
  return parseSystemResponse<SettingsEntity>(response, "Save failed.");
}

export async function deleteSettingsEntity(kind: SettingsEntityKind, id: string, userId: string) {
  const response = await fetch(`${settingsEntityPath(kind)}/${id}`, {
    method: "DELETE",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<{ ok: true }>(response, "Delete failed.");
}

