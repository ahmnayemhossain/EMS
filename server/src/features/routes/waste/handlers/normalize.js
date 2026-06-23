import { createHttpError } from "../../../modules/utilities/record.js";

const VALID_WASTE_TYPES = new Set(["hazardous", "non_hazardous", "recyclable", "sludge", "e_waste"]);
const VALID_DISPOSAL_STATUS = new Set(["stored", "scheduled", "disposed"]);

function requiredString(input, key, label) {
  const value = String(input?.[key] || "").trim();
  if (!value) throw createHttpError(400, `${label} is required.`);
  return value;
}

function optionalString(input, key) {
  const value = String(input?.[key] || "").trim();
  return value || null;
}

function requiredNumber(input, key, label) {
  const value = Number(input?.[key]);
  if (!Number.isFinite(value)) throw createHttpError(400, `${label} must be a number.`);
  return value;
}

function optionalDate(input, key, label) {
  const value = optionalString(input, key);
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw createHttpError(400, `${label} must be YYYY-MM-DD.`);
  return value;
}

export function normalizeWasteInput(input) {
  const wasteType = requiredString(input, "type", "Waste type").toLowerCase();
  if (!VALID_WASTE_TYPES.has(wasteType)) throw createHttpError(400, "Invalid waste type.");

  const disposalStatus = String(input?.disposalStatus || "stored").trim().toLowerCase();
  if (!VALID_DISPOSAL_STATUS.has(disposalStatus)) throw createHttpError(400, "Invalid disposal status.");

  const qtyKg = requiredNumber(input, "qtyKg", "Quantity");
  if (qtyKg < 0) throw createHttpError(400, "Quantity must be >= 0.");

  return {
    facilityId: requiredString(input, "facilityId", "Company"),
    date: optionalDate(input, "date", "Date") ?? new Date().toISOString().slice(0, 10),
    stream: requiredString(input, "stream", "Waste stream"),
    type: wasteType,
    qtyKg,
    storageLocation: requiredString(input, "storageLocation", "Storage location"),
    vendor: optionalString(input, "vendor"),
    disposalStatus,
    manifestNo: optionalString(input, "manifestNo"),
    dueBy: optionalDate(input, "dueBy", "Due by"),
    notes: optionalString(input, "notes"),
  };
}
