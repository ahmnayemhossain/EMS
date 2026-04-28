import { getRequestUserValue, getUserIdByValue } from "./schema.js";
import { query } from "./postgres.js";

export async function getRequestPermissionKeys(req) {
  const userId = await getUserIdByValue(getRequestUserValue(req));
  if (!userId) return [];

  const result = await query(
    `
      SELECT DISTINCT p.key
      FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = $1
    `,
    [userId],
  );

  return result.rows.map((row) => row.key);
}

export function hasPermission(permissionKeys, permission) {
  if (permissionKeys.includes(permission)) return true;
  if (permission.startsWith("settings:") && permissionKeys.includes("settings:manage")) return true;
  return false;
}

export function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const permissionKeys = await getRequestPermissionKeys(req);
      if (!hasPermission(permissionKeys, permission)) {
        return res.status(403).json({ error: "forbidden" });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
