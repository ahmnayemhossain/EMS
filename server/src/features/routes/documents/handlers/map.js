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

function normalizeStatus(expiresOn, fallbackStatus) {
  if (!expiresOn) return fallbackStatus || "valid";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresOn);
  expiry.setHours(0, 0, 0, 0);
  if (Number.isNaN(expiry.getTime())) return fallbackStatus || "valid";

  if (expiry.getTime() < today.getTime()) return "expired";
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return "expiring";
  return "valid";
}

export function rowToDocument(row) {
  const expiresOn = toDateString(row.expires_on);
  return {
    id: String(row.id),
    facilityId: String(row.facility_id),
    companyName: row.company_name || undefined,
    title: row.title,
    category: row.category,
    ownerDepartment: row.owner_department,
    expiresOn,
    status: normalizeStatus(expiresOn, row.status),
    fileName: row.file_name,
    fileUrl: row.file_url || undefined,
    mimeType: row.mime_type || undefined,
    fileSize: toNumber(row.file_size),
    notes: row.notes || undefined,
    uploadedAt: row.file_uploaded_at ? new Date(row.file_uploaded_at).toISOString() : undefined,
    uploadedBy: row.uploaded_by || undefined,
  };
}
