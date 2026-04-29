import { ensureCoreSchema } from "../../shared/schema.js";

let readyPromise;

export function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

export function toCompany(row) {
  return {
    id: String(row.id), name: row.name, shortName: row.short_name || "",
    localName: row.local_name || "", address: row.address || "",
    status: Number(row.is_active ?? 1),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export function normalizeInput(input) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Company name is required.");
  const shortName = String(input.shortName || input.short_name || "").trim();
  if (!shortName) throw new Error("Short name is required.");
  const status = Number(input.status ?? input.isActive ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");
  return {
    name, shortName,
    localName: input.localName || input.local_name ? String(input.localName || input.local_name).trim() : null,
    address: input.address ? String(input.address).trim() : null,
    status,
  };
}
