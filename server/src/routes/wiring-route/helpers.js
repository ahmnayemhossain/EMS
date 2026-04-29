import { ensureCoreSchema } from "../../shared/schema.js";

let readyPromise;

export function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

export function toDateTime(value) {
  return value?.toISOString?.() || value || undefined;
}

export function normalizeInput(input, sourceLabel) {
  const sourceId = String(input.sourceId || input.uomId || "").trim();
  const utilityTypeId = String(input.utilityTypeId || "").trim();
  const status = Number(input.status ?? input.isActive ?? 1);
  if (!sourceId) throw new Error(`${sourceLabel} is required.`);
  if (!utilityTypeId) throw new Error("Utility type is required.");
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");
  return { sourceId, utilityTypeId, status };
}
