import { auditTemplates } from "@/core/data/catalog/audit-templates";
import type { AuditItemStatus } from "@/core/types/models/audit";

export function makeRng(seed: number) {
  let value = seed || 1;
  return () => {
    value ^= value << 13;
    value ^= value >> 17;
    value ^= value << 5;
    return ((value >>> 0) % 10_000) / 10_000;
  };
}

export function pickTemplateId(index: number) {
  const ids = auditTemplates.map((template) => template.id);
  return ids[index % ids.length] ?? "tmpl_iso14001_ems";
}

export function statusFromRng(random: number): AuditItemStatus {
  if (random < 0.08) return "fail";
  if (random < 0.16) return "pending";
  if (random < 0.22) return "na";
  return "pass";
}

export function collectTemplateItemIds(templateId: string) {
  const template = auditTemplates.find((item) => item.id === templateId) ?? auditTemplates[0];
  const itemIds: string[] = [];
  for (const section of template.sections) for (const item of section.items) itemIds.push(item.id);
  return itemIds;
}

export function computeProgress(statuses: AuditItemStatus[]) {
  const total = statuses.length || 1;
  const completed = statuses.filter((status) => status !== "pending").length;
  return Math.round((completed / total) * 100);
}

export function computeScore(statuses: AuditItemStatus[]) {
  const relevant = statuses.filter((status) => status !== "na");
  const total = relevant.length || 1;
  const points = relevant.reduce((sum, status) => sum + (status === "pass" ? 1 : status === "pending" ? 0.5 : 0), 0);
  return Math.round((points / total) * 100);
}
