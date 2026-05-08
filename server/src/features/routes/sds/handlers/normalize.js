import { createHttpError } from "../../../modules/utilities/record.js";

function requiredString(input, key, label) {
  const value = String(input?.[key] || "").trim();
  if (!value) throw createHttpError(400, `${label} is required.`);
  return value;
}

function optionalString(input, key) {
  const value = String(input?.[key] || "").trim();
  return value ? value : null;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const VALID_LANG = new Set(["english", "bangla", "bengali"]);

export function normalizeSdsInput(input) {
  const chemicalName = requiredString(input, "chemicalName", "Chemical name");
  const supplier = requiredString(input, "supplier", "Supplier");
  const languageRaw = requiredString(input, "language", "Language").toLowerCase();
  const language = VALID_LANG.has(languageRaw) ? (languageRaw === "bengali" ? "Bangla" : languageRaw[0].toUpperCase() + languageRaw.slice(1)) : requiredString(input, "language", "Language");
  const revisionDate = requiredString(input, "revisionDate", "Revision date");
  if (!isDateString(revisionDate)) throw createHttpError(400, "Revision date must be YYYY-MM-DD.");

  const sections = Array.isArray(input?.sections) ? input.sections : null;
  if (!sections || !sections.length) throw createHttpError(400, "SDS sections are required.");

  // Expect 16 sections; allow subset but validate ids and content.
  const normalizedSections = sections.map((s) => ({
    id: String(s?.id || "").trim(),
    title: String(s?.title || "").trim(),
    summary: String(s?.summary || "").trim(),
  }));
  for (const s of normalizedSections) {
    const n = Number(s.id);
    if (!Number.isFinite(n) || n < 1 || n > 16) throw createHttpError(400, "Invalid section id.");
    if (!s.title) throw createHttpError(400, "Section title is required.");
    if (!s.summary) throw createHttpError(400, "Section summary is required.");
  }

  return {
    chemicalName,
    supplier,
    language,
    revisionDate,
    fileName: optionalString(input, "fileName"),
    notes: optionalString(input, "notes"),
    sections: normalizedSections,
  };
}

