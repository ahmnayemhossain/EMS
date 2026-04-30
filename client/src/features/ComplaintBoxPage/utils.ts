import type { ReportBoxAttachment, ReportBoxReport } from "@/core/types/ems";

import { facilities } from "@/core/data/mock";

export function getPublicReportBoxUrl(selectedCompanyId: string) {
  if (typeof window === "undefined") return "";
  const { origin, pathname, hash } = window.location;
  const companyCode =
    facilities.find((f) => f.id === selectedCompanyId)?.code?.toLowerCase() ||
    "hfl";
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

export function getWorkingUsersForComplaint(r: ReportBoxReport) {
  const labels = new Set<string>();
  const list: Array<{ id: string; label: string }> = [];

  function push(label?: string) {
    const v = (label || "").trim();
    if (!v) return;
    const key = v.toLowerCase();
    if (labels.has(key)) return;
    labels.add(key);
    list.push({ id: key, label: v });
  }

  if (r.status === "handled") push(r.handledBy);
  push(r.assignedTo);
  for (const m of r.messages) {
    if (!m.author) continue;
    push(m.author);
  }

  return list;
}

