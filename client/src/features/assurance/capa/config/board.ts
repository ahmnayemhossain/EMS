import type { CAPA } from "@/core/types/models/ems";

export type CapaBoardColumn = {
  id: CAPA["status"];
  title: string;
  tone: "neutral" | "info" | "warning" | "critical" | "compliant";
  accentClassName: string;
};

export const capaBoardColumns: CapaBoardColumn[] = [
  { id: "open", title: "Open", tone: "warning", accentClassName: "from-amber-500/18 to-amber-500/5" },
  { id: "in_progress", title: "In progress", tone: "info", accentClassName: "from-sky-500/18 to-sky-500/5" },
  { id: "pending_verification", title: "Pending verification", tone: "neutral", accentClassName: "from-slate-500/14 to-slate-500/5" },
  { id: "closed", title: "Closed", tone: "compliant", accentClassName: "from-emerald-500/18 to-emerald-500/5" },
  { id: "overdue", title: "Overdue", tone: "critical", accentClassName: "from-rose-500/18 to-rose-500/5" },
];

export function getSeverityTone(severity: CAPA["severity"]) {
  if (severity === "critical") return "critical";
  if (severity === "major") return "warning";
  return "neutral";
}

export function isCapaOverdue(item: CAPA) {
  if (item.status === "closed") return false;
  return item.status === "overdue" || item.dueDate < new Date().toISOString().slice(0, 10);
}

export function sortCapas(items: CAPA[]) {
  return [...items].sort((a, b) => {
    const posA = Number(a.positionIndex ?? 0);
    const posB = Number(b.positionIndex ?? 0);
    if (posA !== posB) return posA - posB;
    if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return a.title.localeCompare(b.title);
  });
}

export function reorderCapas(items: CAPA[], movedId: string, targetStatus: CAPA["status"], targetIndex: number) {
  const moved = items.find((item) => item.id === movedId);
  if (!moved) return items;

  const remaining = items.filter((item) => item.id !== movedId);
  const targetItems = sortCapas(remaining.filter((item) => item.status === targetStatus));
  const insertAt = Math.min(Math.max(targetIndex, 0), targetItems.length);
  const reorderedTarget = [
    ...targetItems.slice(0, insertAt),
    { ...moved, status: targetStatus },
    ...targetItems.slice(insertAt),
  ].map((item, index) => ({ ...item, positionIndex: index }));

  const statuses = new Set(items.map((item) => item.status));
  statuses.add(targetStatus);

  const rebuilt = Array.from(statuses).flatMap((status) => {
    if (status === targetStatus) return reorderedTarget;
    return sortCapas(remaining.filter((item) => item.status === status)).map((item, index) => ({
      ...item,
      positionIndex: index,
    }));
  });

  return rebuilt;
}
