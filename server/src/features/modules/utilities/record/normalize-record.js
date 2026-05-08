import { optionalNumber, requiredNumber, requiredString } from "./parsers.js";

const VALID_TYPES = new Set(["electricity", "water", "fuel", "steam", "refrigerant", "other"]);
const VALID_FLAGS = new Set(["normal", "watch", "high"]);
const VALID_STATUSES = new Set(["normal", "watch", "high", "alert"]);

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidUtilityType(type) {
  return VALID_TYPES.has(String(type || "").trim().toLowerCase());
}

export function normalizeRecordInput(input) {
  const type = requiredString(input, "type", "type");
  const periodStart = requiredString(input, "periodStart", "periodStart");
  const periodEnd = requiredString(input, "periodEnd", "periodEnd");
  const dieselLiters = optionalNumber(input, "dieselLiters");
  const value = input.value === null || typeof input.value === "undefined" ? undefined : requiredNumber(input, "value", "value");
  const meterId = optionalNumber(input, "meterId");
  const varianceFlag = input.varianceFlag ? String(input.varianceFlag) : null;
  const status = input.status ? String(input.status) : null;

  if (!isValidUtilityType(type)) throw new Error("Invalid utility type.");
  if (!isDateString(periodStart) || !isDateString(periodEnd)) throw new Error("Period start and end must be valid YYYY-MM-DD dates.");
  if (periodEnd < periodStart) throw new Error("Period end must be after period start.");
  if (typeof dieselLiters === "number" && !Number.isNaN(dieselLiters) && dieselLiters <= 0) throw new Error("dieselLiters must be greater than 0.");
  if (typeof dieselLiters !== "number" && (typeof value !== "number" || value <= 0)) throw new Error("value must be greater than 0.");
  if (varianceFlag && !VALID_FLAGS.has(varianceFlag)) throw new Error("Invalid varianceFlag.");
  if (status && !VALID_STATUSES.has(status)) throw new Error("Invalid status.");

  return { id: optionalNumber(input, "id"), facilityId: requiredString(input, "facilityId", "facilityId"), type, meterId, sourceId: input.sourceId ? String(input.sourceId).trim() : null, periodStart, periodEnd, meterName: requiredString(input, "meterName", "meterName"), dieselLiters, previousReading: optionalNumber(input, "previousReading"), currentReading: optionalNumber(input, "currentReading"), uom: requiredString(input, "uom", "uom"), value: typeof value === "number" ? value : 0, baselineValue: optionalNumber(input, "baselineValue"), minThreshold: optionalNumber(input, "minThreshold"), maxThreshold: optionalNumber(input, "maxThreshold"), variance: optionalNumber(input, "variance"), variancePercent: optionalNumber(input, "variancePercent"), varianceFlag, status, remarks: input.remarks ? String(input.remarks).trim() : null };
}
