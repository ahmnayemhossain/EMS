import { ensureCoreSchema } from "../../shared/schema.js";

let readyPromise;

export function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

export function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

export function toItem(row) {
  return {
    id: String(row.id), name: row.name, status: Number(row.is_active ?? 1),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: toDateTime(row.created_at), updatedAt: toDateTime(row.updated_at),
  };
}

export function normalizeInput(input, label) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error(`${label} name is required.`);
  const status = Number(input.status ?? input.isActive ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");
  return { name, status };
}
