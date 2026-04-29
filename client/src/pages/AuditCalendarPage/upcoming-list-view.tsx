import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import { getFacilityName } from "@/data/mock";
import type { AuditListFilter, ScheduledAudit } from "@/pages/AuditCalendarPage/types";

export function UpcomingListView(props: {
  rows: ScheduledAudit[];
  upcomingCount: number;
  query: string;
  filter: AuditListFilter;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: AuditListFilter) => void;
  onSelectDate: (date: string) => void;
}) {
  return (
    <Card className="shadow-xs flex min-h-0 flex-1 flex-col">
      <CardHeader className="shrink-0 pb-3"><div className="flex items-center justify-between gap-3"><CardTitle>Upcoming audits</CardTitle><div className="text-muted-foreground text-xs tabular-nums">{props.rows.length}{props.query.trim() ? ` / ${props.upcomingCount}` : ""}</div></div><div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"><div className="w-full sm:w-[220px]"><SelectFilter value={props.filter} onChange={(value) => props.onFilterChange(value as AuditListFilter)} placeholder="Filter" items={[{ value: "all", label: "All fields" }, { value: "date", label: "Date" }, { value: "company", label: "Company" }, { value: "audit", label: "Audit name" }, { value: "auditor", label: "Auditor" }]} /></div><div className="flex-1"><SearchInput value={props.query} onChange={props.onQueryChange} placeholder="Search..." /></div></div></CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">{props.rows.length ? <div className="space-y-3">{props.rows.map((audit, index) => <UpcomingAuditRow key={audit.id} audit={audit} previousDate={props.rows[index - 1]?.date} onSelectDate={props.onSelectDate} />)}</div> : <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm">No upcoming audits found.</div>}</CardContent>
    </Card>
  );
}

function UpcomingAuditRow(props: { audit: ScheduledAudit; previousDate?: string; onSelectDate: (date: string) => void }) {
  const showDateHeader = !props.previousDate || props.previousDate !== props.audit.date;
  return <div>{showDateHeader ? <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide">{formatDate(props.audit.date)}</div> : null}<button type="button" onClick={() => props.onSelectDate(props.audit.date)} className="hover:bg-muted/10 w-full rounded-xl border bg-card p-3 text-left transition-colors"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-semibold">{props.audit.name}</div><div className="text-muted-foreground mt-1 text-xs">{getFacilityName(props.audit.facilityId)} • {props.audit.auditor}</div>{props.audit.time?.start ? <div className="text-muted-foreground mt-1 text-xs tabular-nums">{props.audit.time.start}{props.audit.time.end ? `–${props.audit.time.end}` : ""}</div> : null}</div><StatusBadge tone={props.audit.progress >= 75 ? "compliant" : props.audit.progress > 0 ? "warning" : "neutral"}>{props.audit.progress}%</StatusBadge></div></button></div>;
}
