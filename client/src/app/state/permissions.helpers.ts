export const PERMISSION_STORAGE_KEY = "ems:permissions_v1";

export function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

export function canAccessPermission(permissionKeys: string[], permission?: string) {
  if (!permission) return true;
  if (permission.startsWith("settings:") && permissionKeys.includes("settings:manage")) {
    return true;
  }
  return permissionKeys.includes(permission);
}
