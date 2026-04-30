import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { MonthlyReportSnapshot } from "@/core/reports/report-types";
import { formatNumber } from "@/core/utils/format";

export function MonthlySnapshotCard({ rows }: { rows: MonthlyReportSnapshot[] }) {
  return (
    <Card className="shadow-xs">
      <CardHeader><CardTitle>Monthly snapshot</CardTitle></CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {rows.length ? rows.map(([month, info]) => <MonthRow key={month} month={month} count={info.count} total={info.total} />) : <EmptyCard message="Monthly report data will appear after utility records are added." />}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthRow(props: { month: string; count: number; total: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{props.month}</div>
        <StatusBadge tone="info">{props.count} records</StatusBadge>
      </div>
      <div className="text-muted-foreground mt-1 text-sm">{formatNumber(props.total)} total consumption</div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">{message}</div>;
}
