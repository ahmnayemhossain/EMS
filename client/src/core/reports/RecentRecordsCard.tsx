import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { UtilityRecord } from "@/core/types/ems";
import { formatDate, formatNumber, formatUtilityType } from "@/core/utils/format";

export function RecentRecordsCard({ rows }: { rows: UtilityRecord[] }) {
  return (
    <Card className="shadow-xs">
      <CardHeader><CardTitle>Recent utility records</CardTitle></CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {rows.length ? rows.map((row) => <RecentRow key={row.id} row={row} />) : <EmptyCard message="No utility records found for the current filters." />}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentRow({ row }: { row: UtilityRecord }) {
  return (
    <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1.2fr,auto,auto] sm:items-center">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{row.meterName}</div>
        <div className="text-muted-foreground mt-1 text-xs">{formatUtilityType(row.type)}{row.sourceName ? ` - ${row.sourceName}` : ""}</div>
      </div>
      <div className="text-sm font-medium">{formatNumber(row.value)} {row.uom}</div>
      <div className="flex items-center gap-2 sm:justify-end">
        <StatusBadge tone={row.status === "alert" ? "critical" : row.status === "high" ? "warning" : "info"}>{row.status ?? "normal"}</StatusBadge>
        <span className="text-muted-foreground text-xs">{formatDate(row.periodEnd)}</span>
      </div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">{message}</div>;
}
