function toDateString(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toNumber(value) {
  if (value === null || typeof value === "undefined") return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function rowToChemical(row) {
  return {
    id: String(row.id),
    facilityId: String(row.facility_id),
    name: row.name,
    tradeName: row.trade_name || undefined,
    supplier: row.supplier || "",
    storageArea: row.storage_area,
    hazardClasses: toArray(row.hazard_classes),
    approvalStatus: row.approval_status,
    stockKg: toNumber(row.stock_kg) ?? 0,
    minStockKg: toNumber(row.min_stock_kg),
    expiryDate: toDateString(row.expiry_date),
    sdsId: row.sds_id ? String(row.sds_id) : undefined,
    ppe: toArray(row.ppe),
    storageInstructions: toArray(row.storage_instructions),
    compatibilityWarnings: toArray(row.compatibility_warnings),
    linkedWasteStream: row.linked_waste_stream || undefined,
    batches: toArray(row.batches),
    sds: row.sds_id
      ? {
          id: String(row.sds_id),
          chemicalName: row.sds_chemical_name,
          supplier: row.sds_supplier,
          language: row.sds_language,
          revisionDate: toDateString(row.sds_revision_date),
          files: toArray(row.sds_files),
        }
      : undefined,
  };
}

