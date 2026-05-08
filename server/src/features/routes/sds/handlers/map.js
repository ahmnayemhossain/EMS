function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function rowToSdsRecord(row) {
  return {
    id: String(row.id),
    chemicalName: row.chemical_name,
    supplier: row.supplier,
    language: row.language,
    revisionDate: toDateString(row.revision_date),
    fileName: row.file_name || "",
    notes: row.notes || undefined,
    sections: toArray(row.sections),
    files: toArray(row.files),
  };
}

