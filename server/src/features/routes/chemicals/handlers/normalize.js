function requiredString(input, key, label) {
  const value = String(input?.[key] || "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function optionalString(input, key) {
  const value = String(input?.[key] || "").trim();
  return value ? value : null;
}

function optionalNumber(input, key) {
  if (input?.[key] === null || typeof input?.[key] === "undefined" || input?.[key] === "") return null;
  const value = Number(input[key]);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a number.`);
  return value;
}

function requiredNumber(input, key, label) {
  const value = Number(input?.[key]);
  if (!Number.isFinite(value)) throw new Error(`${label} must be a number.`);
  return value;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function optionalJsonArray(input, key) {
  const value = input?.[key];
  if (value === null || typeof value === "undefined" || value === "") return [];
  if (!Array.isArray(value)) throw new Error(`${key} must be an array.`);
  return value;
}

const VALID_APPROVAL = new Set(["approved", "pending", "restricted"]);

export function normalizeChemicalInput(input) {
  const facilityId = requiredString(input, "facilityId", "facilityId");
  const name = requiredString(input, "name", "name");
  const storageArea = requiredString(input, "storageArea", "storageArea");
  const supplier = optionalString(input, "supplier") ?? "";
  const approvalStatusRaw = String(input?.approvalStatus || "pending").trim().toLowerCase();
  if (!VALID_APPROVAL.has(approvalStatusRaw)) throw new Error("Invalid approval status.");
  const stockKg = requiredNumber(input, "stockKg", "stockKg");
  const expiryDate = optionalString(input, "expiryDate");
  if (expiryDate && !isDateString(expiryDate)) throw new Error("expiryDate must be YYYY-MM-DD.");
  const sdsId = optionalString(input, "sdsId");

  return {
    facilityId,
    name,
    tradeName: optionalString(input, "tradeName"),
    supplier,
    storageArea,
    hazardClasses: optionalJsonArray(input, "hazardClasses"),
    approvalStatus: approvalStatusRaw,
    stockKg,
    minStockKg: optionalNumber(input, "minStockKg"),
    expiryDate,
    sdsId: sdsId ? Number(sdsId) : null,
    ppe: optionalJsonArray(input, "ppe"),
    storageInstructions: optionalJsonArray(input, "storageInstructions"),
    compatibilityWarnings: optionalJsonArray(input, "compatibilityWarnings"),
    linkedWasteStream: optionalString(input, "linkedWasteStream"),
    batches: optionalJsonArray(input, "batches"),
  };
}

