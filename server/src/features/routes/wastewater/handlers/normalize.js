import { createHttpError } from "../../../modules/utilities/record.js";

const VALID_POINTS = new Set(["inlet", "outlet"]);

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

function optionalNumber(input, key, label) {
  const raw = input?.[key];
  if (raw === null || typeof raw === "undefined" || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw createHttpError(400, `${label} must be a number.`);
  return value;
}

function requiredDate(input, key, label) {
  const value = requiredString(input, key, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw createHttpError(400, `${label} must be YYYY-MM-DD.`);
  return value;
}

export function normalizeWastewaterInput(input) {
  const point = requiredString(input, "point", "Point").toLowerCase();
  if (!VALID_POINTS.has(point)) throw createHttpError(400, "Invalid sample point.");

  return {
    facilityId: requiredString(input, "facilityId", "Company"),
    sampleDate: requiredDate(input, "sampleDate", "Sample date"),
    point,
    pH: requiredNumber(input, "pH", "pH"),
    COD: requiredNumber(input, "COD", "COD"),
    BOD: requiredNumber(input, "BOD", "BOD"),
    TSS: requiredNumber(input, "TSS", "TSS"),
    DO: optionalNumber(input, "DO", "DO"),
    labReportFileName: optionalString(input, "labReportFileName"),
    notes: optionalString(input, "notes"),
  };
}
