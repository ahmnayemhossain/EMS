export function requiredString(input, key, label) {
  const value = String(input[key] || "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

export function requiredNumber(input, key, label) {
  const value = Number(input[key]);
  if (!Number.isFinite(value)) throw new Error(`${label} must be a number.`);
  return value;
}

export function optionalNumber(input, key) {
  if (input[key] === null || typeof input[key] === "undefined" || input[key] === "") return null;
  const value = Number(input[key]);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a number.`);
  return value;
}

export function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
