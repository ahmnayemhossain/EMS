import type { RoleScope } from "@/types/admin";

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

const SYSTEM_API = "/api/system";

function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

function headers(userId: string) {
  return {
    "Content-Type": "application/json",
    "x-user-id": toServerUserId(userId),
  };
}

async function parseJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : fallback;
    throw new Error(message);
  }

  return data as T;
}

export async function listRoles(userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles`, { cache: "no-store", headers: headers(userId) });
  return parseJsonResponse<RoleEntity[]>(response, "Could not load roles.");
}

export async function listRoleLookups() {
  const response = await fetch(`${SYSTEM_API}/roles/lookups/options`, { cache: "no-store" });
  return parseJsonResponse<{ permissions: PermissionOption[] }>(
    response,
    "Could not load role options.",
  );
}

export async function createRole(role: RoleEntity, userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(role),
  });

  return parseJsonResponse<RoleEntity>(response, "Role create failed.");
}

export async function updateRole(role: RoleEntity, userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles/${role.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(role),
  });

  return parseJsonResponse<RoleEntity>(response, "Role save failed.");
}

export async function deleteRole(id: string, userId: string) {
  const response = await fetch(`${SYSTEM_API}/roles/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });

  return parseJsonResponse<{ ok: true }>(response, "Role delete failed.");
}

export type SettingsEntityKind = "departments" | "designations" | "uom" | "sources" | "suppliers";

export async function listSettingsEntities(kind: SettingsEntityKind, userId: string) {
  const response = await fetch(`${SYSTEM_API}/${kind}`, { cache: "no-store", headers: headers(userId) });
  return parseJsonResponse<SettingsEntity[]>(response, "Could not load records.");
}

export async function createSettingsEntity(kind: SettingsEntityKind, item: SettingsEntity, userId: string) {
  const response = await fetch(`${SYSTEM_API}/${kind}`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(item),
  });

  return parseJsonResponse<SettingsEntity>(response, "Create failed.");
}

export async function updateSettingsEntity(kind: SettingsEntityKind, item: SettingsEntity, userId: string) {
  const response = await fetch(`${SYSTEM_API}/${kind}/${item.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(item),
  });

  return parseJsonResponse<SettingsEntity>(response, "Save failed.");
}

export async function deleteSettingsEntity(kind: SettingsEntityKind, id: string, userId: string) {
  const response = await fetch(`${SYSTEM_API}/${kind}/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });

  return parseJsonResponse<{ ok: true }>(response, "Delete failed.");
}
