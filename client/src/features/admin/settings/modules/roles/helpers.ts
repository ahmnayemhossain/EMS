import type { PermissionOption, RoleEntity } from "@/features/admin/settings/modules/settingsEntityApi";
import type { PermissionColumn, PermissionGroup, RoleValidationErrors } from "@/features/admin/settings/modules/roles/roles.types";

export const permissionColumns: PermissionColumn[] = ["read", "write", "update", "delete"];
export const permissionColumnLabels: Record<PermissionColumn, string> = { read: "Read", write: "Write", update: "Update", delete: "Delete" };

export function blankRole(permissionKeys: string[]): RoleEntity {
  return { id: "", name: "", scope: "company", description: "", permissionKeys: permissionKeys.length ? [permissionKeys[0]] : [], status: 1 };
}

export function validateRole(role: RoleEntity, roles: RoleEntity[], currentId?: string) {
  const errors: RoleValidationErrors = {};
  if (!role.name.trim()) errors.name = "Role name is required";
  else if (roles.some((row) => row.id !== currentId && row.name.toLowerCase() === role.name.toLowerCase())) errors.name = "Role name already exists";
  if (!role.permissionKeys.length) errors.permissionKeys = "At least one permission is required";
  if (![0, 1].includes(Number(role.status))) errors.status = "Status is required";
  return errors;
}

export function firstRoleError(errors: RoleValidationErrors) {
  return Object.values(errors)[0] ?? null;
}

export function groupPermissions(permissions: PermissionOption[]) {
  const groups: PermissionGroup[] = [];
  const byName = new Map<string, PermissionGroup["permissions"]>();
  for (const permission of permissions) {
    const group = permission.group || permission.label.split(" - ")[0] || "Other";
    const action = (permission.action || permission.key.split(":").pop() || "").toLowerCase();
    if (!permissionColumns.includes(action as PermissionColumn)) continue;
    if (!byName.has(group)) { byName.set(group, {}); groups.push({ name: group, permissions: byName.get(group)! }); }
    byName.get(group)![action as PermissionColumn] = permission;
  }
  return groups;
}
