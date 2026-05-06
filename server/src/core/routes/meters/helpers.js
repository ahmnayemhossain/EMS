import { query } from "../../shared/postgres.js";

function requiredString(input, key, label) {
  const value = String(input?.[key] || "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function optionalString(input, key) {
  const value = String(input?.[key] || "").trim();
  return value ? value : null;
}

function requiredId(input, key, label) {
  const raw = requiredString(input, key, label);
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} is invalid.`);
  return value;
}

function optionalId(input, key) {
  const raw = String(input?.[key] || "").trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${key} is invalid.`);
  return value;
}

export function normalizeMeterInput(input) {
  return {
    companyId: requiredId(input, "companyId", "Company"),
    utilityTypeId: requiredId(input, "utilityTypeId", "Utility type"),
    uomId: requiredId(input, "uomId", "UOM"),
    sourceId: optionalId(input, "sourceId"),
    name: requiredString(input, "name", "Name"),
    code: optionalString(input, "code"),
    location: optionalString(input, "location"),
    isActive: String(input?.isActive ?? "1") === "0" ? 0 : 1,
  };
}

export async function assertMeterRefsValid(meter) {
  const [company, ut, uom] = await Promise.all([
    query("SELECT id FROM companies WHERE id = $1", [meter.companyId]),
    query("SELECT id FROM utility_types WHERE id = $1", [meter.utilityTypeId]),
    query("SELECT id FROM uom WHERE id = $1", [meter.uomId]),
  ]);

  if (!company.rowCount) throw new Error("Invalid company.");
  if (!ut.rowCount) throw new Error("Invalid utility type.");
  if (!uom.rowCount) throw new Error("Invalid UOM.");

  if (meter.sourceId) {
    const source = await query("SELECT id FROM sources WHERE id = $1", [meter.sourceId]);
    if (!source.rowCount) throw new Error("Invalid source.");
  }
}

