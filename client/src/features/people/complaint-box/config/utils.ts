import type { CompanyOption } from "@/core/app/state/slices/company";
import { getCompanyCode } from "@/core/companies/directory";
import type { ReportBoxAttachment, ReportBoxReport } from "@/core/types/models/ems";

export function getPublicReportBoxUrl(selectedCompanyId: string, companies: CompanyOption[]) {
  if (typeof window === "undefined") return "";
  const { origin, pathname, hash } = window.location;
  const companyCode = getCompanyCode(selectedCompanyId, companies).toLowerCase();
  if (!companyCode) return "";
  const base = hash.startsWith("#/")
    ? `${origin}${pathname}#/rb/${companyCode}`
    : `${origin}/rb/${companyCode}`;
  return base;
}

export function formatReportNumber(reportId: string) {
  const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
  const digits = reportId.replace(/\D/g, "");
  const tail = (digits.slice(-3) || "0").padStart(3, "0");
  return `${yy}/${tail}`;
}

export function getAttachmentSrc(att?: ReportBoxAttachment) {
  return att?.dataUrl || att?.url || "";
}

export function stripEmsNotePrefix(text?: string) {
  if (!text) return "";
  return text.replace(/^EMS note:\s*/i, "").trim();
}

export function getWorkingUsersForComplaint(report: ReportBoxReport) {
  const labels = new Set<string>();
  const list: Array<{ id: string; label: string }> = [];

  function push(label?: string) {
    const value = (label || "").trim();
    if (!value) return;
    const key = value.toLowerCase();
    if (labels.has(key)) return;
    labels.add(key);
    list.push({ id: key, label: value });
  }

  if (report.status === "handled") push(report.handledBy);
  push(report.assignedTo);
  for (const message of report.messages) {
    if (!message.author) continue;
    push(message.author);
  }

  return list;
}
