import { Card, CardContent } from "@/core/app/components/ui/card";
import { CalendarMonth } from "@/features/AuditCalendarPage/calendar-month";
import type { ScheduledAudit } from "@/features/AuditCalendarPage/types";

export function AuditCalendarView(props: {
  month: Date;
  selectedDateKey: string | null;
  todayKey: string;
  countsByDate: Map<string, number>;
  scheduled: ScheduledAudit[];
  getTone: (key: string) => "critical" | "warning" | "info" | null;
  getLabel: (key: string) => string | null;
  onSelectDay: (key: string, hasCount: boolean) => void;
}) {
  return (
    <Card className="shadow-xs flex min-h-0 flex-1 flex-col">
      <CardContent className="min-h-0 flex-1 overflow-hidden pt-6">
        <div className="hidden h-full min-h-0 flex-col gap-3 sm:flex">
          <CalendarMonth {...props} monthDate={props.month} />
        </div>
      </CardContent>
    </Card>
  );
}
