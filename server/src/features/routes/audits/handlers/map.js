function toDateString(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function toObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function rowToAuditRecord(row) {
  const findingsCount = toObject(row.findings_count);
  return {
    id: String(row.id),
    facilityId: String(row.facility_id),
    companyName: row.company_name || undefined,
    name: row.name,
    customerName: row.customer_name || undefined,
    date: toDateString(row.audit_date) || "",
    nextAuditDate: toDateString(row.next_audit_date),
    auditor: row.auditor,
    progress: toNumber(row.progress, 0),
    overallScore: toNumber(row.overall_score, 0),
    findingsCount: {
      minor: toNumber(findingsCount.minor, 0),
      major: toNumber(findingsCount.major, 0),
      critical: toNumber(findingsCount.critical, 0),
    },
    templateId: row.template_id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    checklist: toArray(row.checklist),
    findings: toArray(row.findings),
  };
}
