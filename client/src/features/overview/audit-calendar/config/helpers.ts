import { formatDate } from "@/core/utils/format";

export function toMins(hhmm: string) {
  const [h, m] = hhmm.split(":").map((s) => Number(s));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function minsToHHMM(mins: number) {
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}

export function toDayKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toPickerDate(dateIso: string) {
  return new Date(`${dateIso}T12:00:00`);
}

export function formatAuditListSearch(date: string, company: string, name: string, auditor: string) {
  return `${date.toLowerCase()} ${formatDate(date).toLowerCase()} ${company.toLowerCase()} ${name.toLowerCase()} ${auditor.toLowerCase()}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
