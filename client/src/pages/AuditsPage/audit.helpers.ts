import { auditTemplates, getTemplateById } from "@/data/audit-templates";
import { formatDate } from "@/utils/format";
import type { AuditItemStatus } from "@/types/audit";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function formatAuditDate(date: string) {
  if (!date) return "Not scheduled";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Not scheduled";
  return formatDate(date);
}

export function defaultStatusesForTemplate(templateId: string) {
  const t = getTemplateById(templateId) ?? auditTemplates[0];
  const out: Record<string, AuditItemStatus> = {};
  for (const s of t.sections) for (const it of s.items) out[it.id] = "pending";
  return out;
}

export function computeChecklistStats(
  templateId: string,
  statusesByItemId: Record<string, AuditItemStatus>,
) {
  const template = getTemplateById(templateId) ?? auditTemplates[0];
  const itemIds = template.sections.flatMap((s) => s.items.map((i) => i.id));
  const statuses = itemIds.map((id) => statusesByItemId[id] ?? "pending");
  const total = statuses.length || 1;
  const completed = statuses.filter((s) => s !== "pending").length;
  const progress = Math.round((completed / total) * 100);
  const relevant = statuses.filter((s) => s !== "na");
  const scoreTotal = relevant.length || 1;
  const scorePoints = relevant.reduce((sum, s) => {
    if (s === "pass") return sum + 1;
    if (s === "pending") return sum + 0.5;
    return sum;
  }, 0);
  const score = Math.round((scorePoints / scoreTotal) * 100);
  const fail = statuses.filter((s) => s === "fail").length;
  const pending = statuses.filter((s) => s === "pending").length;
  return { template, total, completed, progress, score, fail, pending };
}

export function getStatusMeta(status: AuditItemStatus) {
  switch (status) {
    case "pass":
      return {
        label: "Pass",
        dot: "bg-[var(--success-600)]",
        chip: "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--success-900)]",
      };
    case "fail":
      return {
        label: "Fail",
        dot: "bg-[var(--critical-600)]",
        chip: "border-[var(--critical-100)] bg-[var(--critical-50)] text-[var(--critical-900)]",
      };
    case "na":
      return {
        label: "N/A",
        dot: "bg-muted-foreground/40",
        chip: "border-border bg-muted/40 text-foreground",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        dot: "bg-[var(--warning-600)]",
        chip: "border-[var(--warning-100)] bg-[var(--warning-50)] text-[var(--warning-900)]",
      };
  }
}

