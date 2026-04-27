import * as React from "react";
import { Link } from "react-router";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import { audits, facilities, getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { DetailPanel } from "@/components/DetailPanel";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import type { Audit } from "@/types/ems";

type ScheduledAudit = Audit & {
  time?: { start: string; end?: string };
};

function toMins(hhmm: string) {
  const [h, m] = hhmm.split(":").map((s) => Number(s));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function minsToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toPickerDate(dateIso: string) {
  // Stable DayPicker date: use midday to avoid timezone edge cases.
  return new Date(`${dateIso}T12:00:00`);
}

// Single-month calendar canvas (range presets can be added later).

const auditTemplates = [
  "ISO 14001 Internal Audit",
  "Buyer EHS Audit",
  "Chemical storage inspection",
  "ETP compliance audit",
  "Waste vendor verification",
  "Emergency preparedness drill",
];

const auditors = [
  "User One (EMP-0001)",
  "User Two (EMP-0002)",
  "User Three (EMP-0003)",
  "User Four (EMP-0004)",
  "User Five (EMP-0005)",
  "User Six (EMP-0006)",
  "User Seven (EMP-0007)",
];

export function AuditCalendarPage() {
  const [scheduled, setScheduled] = React.useState<ScheduledAudit[]>(() =>
    audits.slice().map((a, idx) => ({
      ...a,
      time:
        idx % 3 === 0
          ? { start: "09:30", end: "11:00" }
          : idx % 3 === 1
            ? { start: "14:00", end: "15:30" }
            : undefined,
    })),
  );
  const [anchorMonth, setAnchorMonth] = React.useState<Date>(() => {
    const first = scheduled[0]?.date;
    return startOfMonth(first ? toPickerDate(first) : new Date());
  });
  const [selectedDateKey, setSelectedDateKey] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"calendar" | "list">("calendar");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [listQuery, setListQuery] = React.useState("");
  const [listFilter, setListFilter] = React.useState<
    "all" | "date" | "factory" | "audit" | "auditor"
  >("all");

  const [createFactoryId, setCreateFactoryId] = React.useState<string>(facilities[0]?.id ?? "");
  const [createName, setCreateName] = React.useState<string>(auditTemplates[0] ?? "");
  const [createAuditor, setCreateAuditor] = React.useState<string>(auditors[0] ?? "");
  const [createDate, setCreateDate] = React.useState<string>(() => {
    const now = new Date();
    return toDayKey(now);
  });
  const [createStartTime, setCreateStartTime] = React.useState<string>("10:00");
  const [createDuration, setCreateDuration] = React.useState<string>("60");
  const [createNotes, setCreateNotes] = React.useState<string>("");

  const countsByDate = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const a of scheduled) {
      map.set(a.date, (map.get(a.date) ?? 0) + 1);
    }
    return map;
  }, [scheduled]);

  const upcoming = React.useMemo(() => {
    const today = toDayKey(new Date());
    return scheduled
      .slice()
      .filter((a) => a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  }, [scheduled]);

  const filteredUpcoming = React.useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return upcoming;

    return upcoming.filter((a) => {
      const dateLabel = formatDate(a.date).toLowerCase();
      const factory = getFacilityName(a.facilityId).toLowerCase();
      const audit = a.name.toLowerCase();
      const auditor = a.auditor.toLowerCase();

      switch (listFilter) {
        case "date":
          return a.date.toLowerCase().includes(q) || dateLabel.includes(q);
        case "factory":
          return factory.includes(q);
        case "audit":
          return audit.includes(q);
        case "auditor":
          return auditor.includes(q);
        case "all":
        default:
          return (
            a.date.toLowerCase().includes(q) ||
            dateLabel.includes(q) ||
            factory.includes(q) ||
            audit.includes(q) ||
            auditor.includes(q)
          );
      }
    });
  }, [upcoming, listFilter, listQuery]);

  const auditsForSelectedKey = React.useMemo(() => {
    if (!selectedDateKey) return [];
    return scheduled
      .filter((a) => a.date === selectedDateKey)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [scheduled, selectedDateKey]);

  const todayKey = React.useMemo(() => toDayKey(new Date()), []);
  const durationMins = Math.max(15, Number(createDuration) || 60);
  const computedEndTime = React.useMemo(() => {
    const start = toMins(createStartTime);
    if (start === null) return undefined;
    return minsToHHMM(Math.min(start + durationMins, 23 * 60 + 59));
  }, [createStartTime, durationMins]);

  const createHasConflict = React.useMemo(() => {
    const start = toMins(createStartTime);
    const end = computedEndTime ? toMins(computedEndTime) : null;
    if (start === null || end === null) return false;

    const list = scheduled.filter((a) => a.date === createDate).filter((a) => a.time?.start);
    for (const a of list) {
      const s = a.time?.start ? toMins(a.time.start) : null;
      const e = a.time?.end ? toMins(a.time.end) : (s !== null ? s + 60 : null);
      if (s === null || e === null) continue;
      const overlap = start < e && end > s;
      if (overlap) return true;
    }
    return false;
  }, [createStartTime, computedEndTime, scheduled, createDate]);

  const monthsToRender = React.useMemo(() => {
    return [anchorMonth];
  }, [anchorMonth]);

  function shiftWindow(dir: "prev" | "next") {
    setAnchorMonth((prev) => (dir === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)));
  }

  function toneForDay(key: string) {
    if (!countsByDate.has(key)) return null;
    if (key < todayKey) return "critical" as const;
    if (key === todayKey) return "warning" as const;
    return "info" as const;
  }

  function labelForDay(key: string) {
    const count = countsByDate.get(key) ?? 0;
    if (!count) return null;
    if (key < todayKey) return count === 1 ? "Missed" : `Missed (${count})`;
    if (key === todayKey) return count === 1 ? "Today" : `Today (${count})`;
    return count === 1 ? "Scheduled" : `Scheduled (${count})`;
  }

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-4">
      <div className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              value={view}
              onValueChange={(v) => setView(v === "list" ? "list" : "calendar")}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:w-[260px]">
                <TabsTrigger value="calendar" className="min-w-0 gap-2">
                  <CalendarDays className="size-4" />
                  <span className="truncate">Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="min-w-0 gap-2">
                  <List className="size-4" />
                  <span className="truncate">List</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="inline-flex items-center overflow-hidden rounded-full border bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={() => shiftWindow("prev")}
                aria-label="Previous"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="px-3 text-sm font-semibold tracking-tight text-[var(--calendar-accent)]">
                {format(monthsToRender[0], "MMMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shiftWindow("next")}
                aria-label="Next"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <CreateActionDialog
            title="Add audit"
            triggerLabel="Add audit"
            open={createOpen}
            onOpenChange={setCreateOpen}
            submitDisabled={createHasConflict}
            onCreate={() => {
              if (!createFactoryId || !createName || !createAuditor || !createDate) return false;

              const id = `audit_${Date.now()}`;
              const newAudit: ScheduledAudit = {
                id,
                facilityId: createFactoryId,
                name: createName,
                date: createDate,
                auditor: createAuditor,
                progress: 0,
                overallScore: 0,
                findingsCount: { minor: 0, major: 0, critical: 0 },
                time:
                  createStartTime && computedEndTime
                    ? { start: createStartTime, end: computedEndTime }
                    : undefined,
              };

              setScheduled((prev) => [newAudit, ...prev]);
              const nextMonth = startOfMonth(toPickerDate(createDate));
              setAnchorMonth(nextMonth);
              setSelectedDateKey(createDate);
              setCreateNotes("");
              setView("calendar");
              return true;
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <div className="text-muted-foreground text-xs">Factory</div>
              <SelectFilter
                value={createFactoryId}
                onChange={setCreateFactoryId}
                placeholder="Select factory"
                items={facilities.map((f) => ({ value: f.id, label: f.name }))}
              />
            </div>
            <div className="grid gap-1.5">
              <div className="text-muted-foreground text-xs">Audit name</div>
              <SelectFilter
                value={createName}
                onChange={setCreateName}
                placeholder="Select template"
                items={auditTemplates.map((t) => ({ value: t, label: t }))}
              />
            </div>
            <div className="grid gap-1.5">
              <div className="text-muted-foreground text-xs">Auditor</div>
              <SelectFilter
                value={createAuditor}
                onChange={setCreateAuditor}
                placeholder="Select auditor"
                items={auditors.map((u) => ({ value: u, label: u }))}
              />
            </div>
            <div className="grid gap-1.5">
              <div className="text-muted-foreground text-xs">Date</div>
              <Input
                type="date"
                value={createDate}
                onChange={(e) => setCreateDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <div className="text-muted-foreground text-xs">Start time</div>
              <Input
                type="time"
                value={createStartTime}
                onChange={(e) => setCreateStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <div className="text-muted-foreground text-xs">Duration</div>
              <SelectFilter
                value={createDuration}
                onChange={setCreateDuration}
                placeholder="Duration"
                items={[
                  { value: "30", label: "30 min" },
                  { value: "60", label: "60 min" },
                  { value: "90", label: "90 min" },
                  { value: "120", label: "120 min" },
                ]}
              />
              <div className="text-muted-foreground text-xs tabular-nums">
                Ends at {computedEndTime ?? "—"}
              </div>
              {createHasConflict ? (
                <div className="text-destructive text-xs font-medium">
                  Time overlaps another audit for this day.
                </div>
              ) : null}
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <div className="text-muted-foreground text-xs">Notes</div>
              <Textarea
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="Optional notes (mock UI)"
              />
            </div>
            </div>
          </CreateActionDialog>
        </div>
      </div>

      {view === "calendar" ? (
        <Card className="shadow-xs flex min-h-0 flex-1 flex-col">
          <CardContent className="min-h-0 flex-1 overflow-hidden pt-6">
            <div className="hidden sm:flex h-full min-h-0 flex-col gap-3">
              {monthsToRender.map((monthDate) => {
                const monthStart = startOfMonth(monthDate);
                const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
                const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });

                const days: Date[] = [];
                for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
                const weekRows = Math.ceil(days.length / 7);

                const isSingleMonth = monthsToRender.length === 1;
                const cellClass = isSingleMonth
                  ? "relative min-h-0 overflow-hidden bg-card px-3 py-2 transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--calendar-accent)]"
                  : "relative min-h-0 overflow-hidden bg-card px-2 py-2 transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--calendar-accent)]";

                const dayPillClass = isSingleMonth
                  ? "grid size-8 place-items-center rounded-full text-sm font-semibold"
                  : "grid size-7 place-items-center rounded-full text-xs font-semibold";

                return (
                  <div key={toDayKey(monthStart)} className="flex min-h-0 flex-1 flex-col gap-2">
                    <div className="grid grid-cols-7">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div
                          key={d}
                          className="text-muted-foreground px-2 py-2 text-center text-xs font-semibold tracking-wide"
                        >
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden rounded-xl border bg-border/70 p-px">
                      <div
                        className={`grid h-full grid-cols-7 gap-px bg-border/70 ${
                          weekRows === 5 ? "grid-rows-5" : "grid-rows-6"
                        }`}
                      >
                      {days.map((day) => {
                        const key = toDayKey(day);
                        const count = countsByDate.get(key) ?? 0;
                        const isSelected = selectedDateKey === key;
                        const tone = toneForDay(key);
                        const label = labelForDay(key);
                        const isToday = key === todayKey;
                        const dayAudits = count > 0 ? scheduled.filter((a) => a.date === key) : [];
                        const primary = dayAudits[0];

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              if (count === 0) {
                                setCreateDate(key);
                                setCreateOpen(true);
                                return;
                              }
                              setSelectedDateKey(key);
                            }}
                            className={[
                              cellClass,
                              !isSameMonth(day, monthStart) ? "opacity-55" : "",
                              isSelected ? "ring-2 ring-[var(--calendar-accent)]" : "",
                              isToday && !isSelected ? "ring-1 ring-[var(--calendar-accent)]/30" : "",
                              "group",
                              "cursor-pointer",
                          ].join(" ")}
                        >
                            {count === 0 ? (
                              <span className="text-muted-foreground/60 pointer-events-none absolute right-2 top-2 text-sm opacity-0 transition-opacity group-hover:opacity-100">
                                +
                              </span>
                            ) : null}
                            <div className="flex h-full flex-col items-start justify-between gap-2">
                              <div className="flex w-full items-start justify-between">
                                <div
                                  className={[
                                    dayPillClass,
                                    isToday
                                      ? "bg-[var(--calendar-accent)] text-white"
                                      : "text-foreground/90",
                                  ].join(" ")}
                                >
                                  {day.getDate()}
                                </div>
                              </div>

                              {count > 0 && primary ? (
                                <div className="w-full space-y-1">
                                  <div
                                    className={[
                                      "flex w-full items-center gap-2 overflow-hidden rounded-md border px-2 py-1 text-[11px] font-medium",
                                      tone === "critical"
                                        ? "border-[color-mix(in_oklab,var(--critical-500)_22%,var(--border))] bg-[color-mix(in_oklab,var(--critical-500)_10%,transparent)]"
                                        : tone === "warning"
                                          ? "border-[color-mix(in_oklab,var(--warning-500)_22%,var(--border))] bg-[color-mix(in_oklab,var(--warning-500)_10%,transparent)]"
                                          : "border-[color-mix(in_oklab,var(--calendar-accent)_22%,var(--border))] bg-[color-mix(in_oklab,var(--calendar-accent)_10%,transparent)]",
                                    ].join(" ")}
                                    title={primary.name}
                                  >
                                    <span
                                      className={[
                                        "h-4 w-1 rounded-full",
                                        tone === "critical"
                                          ? "bg-[var(--critical-500)]"
                                          : tone === "warning"
                                            ? "bg-[var(--warning-500)]"
                                            : "bg-[var(--calendar-accent)]",
                                      ].join(" ")}
                                      aria-hidden
                                    />
                                    <span className="min-w-0 flex-1 truncate">
                                      {primary.time?.start
                                        ? `${primary.time.start}${primary.time.end ? `–${primary.time.end}` : ""} `
                                        : ""}
                                      {primary.name}
                                    </span>
                                    <span className="text-muted-foreground text-xs tabular-nums">
                                      {count}
                                    </span>
                                  </div>
                                  {label ? (
                                    <div className="text-muted-foreground text-[11px]">
                                      {label}
                                      {dayAudits.length > 1 ? ` • +${dayAudits.length - 1} more` : ""}
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs"> </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xs flex min-h-0 flex-1 flex-col">
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Upcoming audits</CardTitle>
              <div className="text-muted-foreground text-xs tabular-nums">
                {filteredUpcoming.length}
                {listQuery.trim() ? ` / ${upcoming.length}` : ""}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[220px]">
                <SelectFilter
                  value={listFilter}
                  onChange={(v) => setListFilter(v as typeof listFilter)}
                  placeholder="Filter"
                  items={[
                    { value: "all", label: "All fields" },
                    { value: "date", label: "Date" },
                    { value: "factory", label: "Factory" },
                    { value: "audit", label: "Audit name" },
                    { value: "auditor", label: "Auditor" },
                  ]}
                />
              </div>
              <div className="flex-1">
                <SearchInput
                  value={listQuery}
                  onChange={setListQuery}
                  placeholder="Search..."
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
            {filteredUpcoming.length ? (
              <div className="space-y-3">
                {filteredUpcoming.map((a, idx) => {
                  const showDateHeader =
                    idx === 0 || filteredUpcoming[idx - 1]!.date !== a.date;

                  return (
                    <div key={a.id}>
                      {showDateHeader ? (
                        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide">
                          {formatDate(a.date)}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSelectedDateKey(a.date)}
                        className="hover:bg-muted/10 w-full rounded-xl border bg-card p-3 text-left transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{a.name}</div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              {getFacilityName(a.facilityId)} • {a.auditor}
                            </div>
                            {a.time?.start ? (
                              <div className="text-muted-foreground mt-1 text-xs tabular-nums">
                                {a.time.start}
                                {a.time.end ? `–${a.time.end}` : ""}
                              </div>
                            ) : null}
                          </div>
                          <StatusBadge
                            tone={
                              a.progress >= 75
                                ? "compliant"
                                : a.progress > 0
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {a.progress}%
                          </StatusBadge>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
                No upcoming audits found.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <DetailPanel
        open={Boolean(selectedDateKey && auditsForSelectedKey.length)}
        onOpenChange={(open) => {
          if (!open) setSelectedDateKey(null);
        }}
        title={selectedDateKey ? `Audits • ${formatDate(selectedDateKey)}` : "Audits"}
        description={
          selectedDateKey ? `${auditsForSelectedKey.length} scheduled` : undefined
        }
      >
        {selectedDateKey && auditsForSelectedKey.length ? (
          <div className="space-y-4">
            {auditsForSelectedKey.map((a) => (
              <div key={a.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.name}</div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {getFacilityName(a.facilityId)} • {a.auditor}
                    </div>
                    {a.time?.start ? (
                      <div className="text-muted-foreground mt-1 text-xs tabular-nums">
                        {a.time.start}
                        {a.time.end ? `–${a.time.end}` : ""}
                      </div>
                    ) : null}
                  </div>
                  <StatusBadge
                    tone={
                      a.progress >= 75
                        ? "compliant"
                        : a.progress > 0
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {a.progress}%
                  </StatusBadge>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border p-2">
                    <div className="text-muted-foreground text-[11px]">Score</div>
                    <div className="mt-1">
                      <StatusBadge
                        tone={
                          a.overallScore >= 85
                            ? "compliant"
                            : a.overallScore >= 70
                              ? "warning"
                              : a.overallScore > 0
                                ? "critical"
                                : "neutral"
                        }
                      >
                        {a.overallScore ? `${a.overallScore}%` : "—"}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="rounded-lg border p-2">
                    <div className="text-muted-foreground text-[11px]">Findings</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <StatusBadge tone="neutral">{a.findingsCount.minor}</StatusBadge>
                      <StatusBadge tone="warning">{a.findingsCount.major}</StatusBadge>
                      <StatusBadge tone="critical">{a.findingsCount.critical}</StatusBadge>
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground mt-3 text-xs">
                  Time slot: TBD
                </div>
              </div>
            ))}

            <Button asChild variant="outline" className="w-full">
              <Link to="/audits">Open audits module</Link>
            </Button>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
