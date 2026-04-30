import { query } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";

let readyPromise;

export function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

export function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

export function toRole(row) {
  return { id: String(row.id), name: row.name, scope: row.scope, description: row.description || "", permissionKeys: Array.isArray(row.permission_keys) ? row.permission_keys.filter(Boolean) : [], status: Number(row.is_active ?? 1), createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined, createdByUserName: row.created_by_user_name || undefined, updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined, updatedByUserName: row.updated_by_user_name || undefined, createdAt: toDateTime(row.created_at), updatedAt: toDateTime(row.updated_at) };
}

export function normalizeRoleInput(input) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Role name is required.");
  const scope = String(input.scope || "company");
  if (!["group", "company"].includes(scope)) throw new Error("Invalid role scope.");
  const permissionKeys = Array.isArray(input.permissionKeys) ? input.permissionKeys.map((key) => String(key).trim()).filter(Boolean) : [];
  if (!permissionKeys.length) throw new Error("Select at least one permission.");
  const status = Number(input.status ?? input.isActive ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");
  return { name, scope, description: input.description ? String(input.description).trim() : null, permissionKeys, status };
}

export async function assertPermissionsExist(permissionKeys) {
  const result = await query("SELECT key FROM permissions WHERE key = ANY($1::text[])", [permissionKeys]);
  if (result.rowCount !== permissionKeys.length) throw new Error("Invalid permission.");
}
