import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

import { weekdayLabels } from "@/features/overview/audit-calendar/config/constants";
import { CalendarDayCell } from "@/features/overview/audit-calendar/pages/calendar-day-cell";
import { toDayKey } from "@/features/overview/audit-calendar/config/helpers";
import type { ScheduledAudit } from "@/features/overview/audit-calendar/config/types";

export function CalendarMonth(props: {
  monthDate: Date;
  selectedDateKey: string | null;
  todayKey: string;
  countsByDate: Map<string, number>;
  scheduled: ScheduledAudit[];
  getTone: (key: string) => "critical" | "warning" | "info" | null;
  getLabel: (key: string) => string | null;
  onSelectDay: (key: string, hasCount: boolean) => void;
}) {
  const monthStart = startOfMonth(props.monthDate);
  const days = buildDays(monthStart);
  const weekRows = Math.ceil(days.length / 7);
  const cellClass = "relative min-h-0 overflow-hidden bg-card px-3 py-2 transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--calendar-accent)]";
  const dayPillClass = "grid size-8 place-items-center rounded-full text-sm font-semibold";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="grid grid-cols-7">{weekdayLabels.map((day) => <div key={day} className="text-muted-foreground px-2 py-2 text-center text-xs font-semibold tracking-wide">{day}</div>)}</div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border bg-border/70 p-px">
        <div className={`grid h-full grid-cols-7 gap-px bg-border/70 ${weekRows === 5 ? "grid-rows-5" : "grid-rows-6"}`}>
          {days.map((day) => <CalendarCellWrapper key={toDayKey(day)} day={day} monthStart={monthStart} cellClass={cellClass} dayPillClass={dayPillClass} {...props} />)}
        </div>
      </div>
    </div>
  );
}

function buildDays(monthStart: Date) {
  const days: Date[] = [];
  for (let day = startOfWeek(monthStart, { weekStartsOn: 0 }); day <= endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 }); day = addDays(day, 1)) days.push(day);
  return days;
}

function CalendarCellWrapper(props: any) {
  const dayKey = toDayKey(props.day);
  const count = props.countsByDate.get(dayKey) ?? 0;
  const dayAudits = count > 0 ? props.scheduled.filter((audit: ScheduledAudit) => audit.date === dayKey) : [];
  return <CalendarDayCell day={props.day} dayKey={dayKey} monthStart={props.monthStart} count={count} selectedDateKey={props.selectedDateKey} todayKey={props.todayKey} dayAudits={dayAudits} cellClass={props.cellClass} dayPillClass={props.dayPillClass} tone={props.getTone(dayKey)} label={props.getLabel(dayKey)} onSelectDay={props.onSelectDay} />;
}
