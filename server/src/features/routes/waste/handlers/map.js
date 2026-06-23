function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function rowToWasteRecord(row) {
  return {
    id: String(row.id),
    facilityId: String(row.facility_id),
    date: toDateString(row.log_date),
    stream: row.stream,
    type: row.waste_type,
    qtyKg: Number(row.qty_kg || 0),
    storageLocation: row.storage_location,
    vendor: row.vendor || undefined,
    disposalStatus: row.disposal_status,
    manifestNo: row.manifest_no || undefined,
    dueBy: row.due_by ? toDateString(row.due_by) : undefined,
    notes: row.notes || undefined,
    files: toArray(row.files),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
