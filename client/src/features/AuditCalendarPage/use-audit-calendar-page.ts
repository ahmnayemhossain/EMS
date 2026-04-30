import * as React from "react";
import { addMonths, startOfMonth, subMonths } from "date-fns";

import { audits, facilities, getFacilityName } from "@/core/data/mock";
import { formatAuditListSearch, minsToHHMM, toDayKey, toMins, toPickerDate } from "@/features/AuditCalendarPage/helpers";
import type { AuditListFilter, AuditCalendarView, ScheduledAudit } from "@/features/AuditCalendarPage/types";

export function useAuditCalendarPage() {
  const [scheduled, setScheduled] = React.useState<ScheduledAudit[]>(() => audits.slice().map((audit, index) => ({ ...audit, time: index % 3 === 0 ? { start: "09:30", end: "11:00" } : index % 3 === 1 ? { start: "14:00", end: "15:30" } : undefined })));
  const [anchorMonth, setAnchorMonth] = React.useState<Date>(() => startOfMonth(scheduled[0]?.date ? toPickerDate(scheduled[0].date) : new Date()));
  const [selectedDateKey, setSelectedDateKey] = React.useState<string | null>(null);
  const [view, setView] = React.useState<AuditCalendarView>("calendar");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [listQuery, setListQuery] = React.useState("");
  const [listFilter, setListFilter] = React.useState<AuditListFilter>("all");
  const [form, setForm] = React.useState({ createCompanyId: facilities[0]?.id ?? "", createName: "ISO 14001 Internal Audit", createAuditor: "User One (EMP-0001)", createDate: toDayKey(new Date()), createStartTime: "10:00", createDuration: "60", createNotes: "" });
  const todayKey = React.useMemo(() => toDayKey(new Date()), []);
  const countsByDate = React.useMemo(() => new Map<string, number>(scheduled.map((audit) => [audit.date, (scheduled.filter((item) => item.date === audit.date).length)])), [scheduled]);
  const upcoming = React.useMemo(() => scheduled.slice().filter((audit) => audit.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)), [scheduled, todayKey]);
  const filteredUpcoming = React.useMemo(() => filterUpcoming(upcoming, listFilter, listQuery), [upcoming, listFilter, listQuery]);
  const auditsForSelectedKey = React.useMemo(() => !selectedDateKey ? [] : scheduled.filter((audit) => audit.date === selectedDateKey).sort((a, b) => a.name.localeCompare(b.name)), [scheduled, selectedDateKey]);
  const durationMins = Math.max(15, Number(form.createDuration) || 60);
  const computedEndTime = React.useMemo(() => { const start = toMins(form.createStartTime); return start === null ? undefined : minsToHHMM(Math.min(start + durationMins, 23 * 60 + 59)); }, [durationMins, form.createStartTime]);
  const createHasConflict = React.useMemo(() => hasConflict(scheduled, form.createDate, form.createStartTime, computedEndTime), [scheduled, form.createDate, form.createStartTime, computedEndTime]);
  return { facilities, scheduled, anchorMonth, selectedDateKey, view, createOpen, listQuery, listFilter, form, countsByDate, upcoming, filteredUpcoming, auditsForSelectedKey, todayKey, computedEndTime, createHasConflict, setScheduled, setAnchorMonth, setSelectedDateKey, setView, setCreateOpen, setListQuery, setListFilter, setForm, shiftWindow: (dir: "prev" | "next") => setAnchorMonth((prev) => dir === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)) };
}

function filterUpcoming(upcoming: ScheduledAudit[], filter: AuditListFilter, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return upcoming;
  return upcoming.filter((audit) => matchesFilter(audit, filter, q));
}

function matchesFilter(audit: ScheduledAudit, filter: AuditListFilter, query: string) {
  const company = getFacilityName(audit.facilityId);
  const allText = formatAuditListSearch(audit.date, company, audit.name, audit.auditor);
  if (filter === "all") return allText.includes(query);
  if (filter === "date") return `${audit.date.toLowerCase()} ${allText}`.includes(query);
  if (filter === "company") return company.toLowerCase().includes(query);
  if (filter === "audit") return audit.name.toLowerCase().includes(query);
  return audit.auditor.toLowerCase().includes(query);
}

function hasConflict(scheduled: ScheduledAudit[], date: string, startTime: string, endTime?: string) {
  const start = toMins(startTime);
  const end = endTime ? toMins(endTime) : null;
  if (start === null || end === null) return false;
  return scheduled.filter((audit) => audit.date === date && audit.time?.start).some((audit) => { const s = audit.time?.start ? toMins(audit.time.start) : null; const e = audit.time?.end ? toMins(audit.time.end) : s !== null ? s + 60 : null; return s !== null && e !== null && start < e && end > s; });
}
