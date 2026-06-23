function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function buildExceedance(row) {
  const items = [];
  const pH = Number(row.ph ?? 0);
  const cod = Number(row.cod ?? 0);
  const bod = Number(row.bod ?? 0);
  const tss = Number(row.tss ?? 0);

  if (pH < 6 || pH > 9) items.push("pH");
  if (cod > 250) items.push("COD");
  if (bod > 80) items.push("BOD");
  if (tss > 150) items.push("TSS");

  return items;
}

export function rowToWastewaterRecord(row) {
  const exceedance = buildExceedance(row);
  const labReport =
    row.lab_report_url || row.lab_report_name
      ? {
          id: row.lab_report_id ? Number(row.lab_report_id) : undefined,
          fileName: row.lab_report_original_name || row.lab_report_name,
          storedName: row.lab_report_stored_name || undefined,
          mimeType: row.lab_report_mime_type || undefined,
          fileSize: row.lab_report_file_size ? Number(row.lab_report_file_size) : undefined,
          storagePath: row.lab_report_storage_path || undefined,
          url: row.lab_report_url || undefined,
          uploadedAt: row.lab_report_uploaded_at || row.updated_at || row.created_at,
        }
      : undefined;

  return {
    id: String(row.id),
    facilityId: String(row.facility_id),
    sampleDate: toDateString(row.sample_date),
    point: row.sample_point,
    pH: Number(row.ph ?? 0),
    COD: Number(row.cod ?? 0),
    BOD: Number(row.bod ?? 0),
    TSS: Number(row.tss ?? 0),
    DO: row.do_value == null ? undefined : Number(row.do_value),
    exceedance: exceedance.length ? exceedance : undefined,
    labReport,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
