import type { ScheduledAudit } from "@/features/AuditCalendarPage/types";

export function CalendarDayCell(props: {
  day: Date;
  dayKey: string;
  monthStart: Date;
  count: number;
  selectedDateKey: string | null;
  todayKey: string;
  dayAudits: ScheduledAudit[];
  cellClass: string;
  dayPillClass: string;
  tone: "critical" | "warning" | "info" | null;
  label: string | null;
  onSelectDay: (key: string, hasCount: boolean) => void;
}) {
  const isSelected = props.selectedDateKey === props.dayKey;
  const isToday = props.dayKey === props.todayKey;
  const primary = props.dayAudits[0];
  const monthMatch = props.day.getMonth() === props.monthStart.getMonth();

  return (
    <button type="button" onClick={() => props.onSelectDay(props.dayKey, props.count > 0)} className={[props.cellClass, !monthMatch ? "opacity-55" : "", isSelected ? "ring-2 ring-[var(--calendar-accent)]" : "", isToday && !isSelected ? "ring-1 ring-[var(--calendar-accent)]/30" : "", "group cursor-pointer"].join(" ")}>
      {props.count === 0 ? <span className="text-muted-foreground/60 pointer-events-none absolute right-2 top-2 text-sm opacity-0 transition-opacity group-hover:opacity-100">+</span> : null}
      <div className="flex h-full flex-col items-start justify-between gap-2">
        <div className="flex w-full items-start justify-between"><div className={[props.dayPillClass, isToday ? "bg-[var(--calendar-accent)] text-white" : "text-foreground/90"].join(" ")}>{props.day.getDate()}</div></div>
        {props.count > 0 && primary ? <AuditBadge {...props} primary={primary} /> : <span className="text-muted-foreground text-xs"> </span>}
      </div>
    </button>
  );
}

function AuditBadge(props: any) {
  const badgeClass = props.tone === "critical" ? "border-[color-mix(in_oklab,var(--critical-500)_22%,var(--border))] bg-[color-mix(in_oklab,var(--critical-500)_10%,transparent)]" : props.tone === "warning" ? "border-[color-mix(in_oklab,var(--warning-500)_22%,var(--border))] bg-[color-mix(in_oklab,var(--warning-500)_10%,transparent)]" : "border-[color-mix(in_oklab,var(--calendar-accent)_22%,var(--border))] bg-[color-mix(in_oklab,var(--calendar-accent)_10%,transparent)]";
  const dotClass = props.tone === "critical" ? "bg-[var(--critical-500)]" : props.tone === "warning" ? "bg-[var(--warning-500)]" : "bg-[var(--calendar-accent)]";
  return <div className="w-full space-y-1"><div className={["flex w-full items-center gap-2 overflow-hidden rounded-md border px-2 py-1 text-[11px] font-medium", badgeClass].join(" ")} title={props.primary.name}><span className={["h-4 w-1 rounded-full", dotClass].join(" ")} aria-hidden /><span className="min-w-0 flex-1 truncate">{props.primary.time?.start ? `${props.primary.time.start}${props.primary.time.end ? `–${props.primary.time.end}` : ""} ` : ""}{props.primary.name}</span><span className="text-muted-foreground text-xs tabular-nums">{props.count}</span></div>{props.label ? <div className="text-muted-foreground text-[11px]">{props.label}{props.dayAudits.length > 1 ? ` • +${props.dayAudits.length - 1} more` : ""}</div> : null}</div>;
}
