import { Card, CardContent } from "@/core/app/components/ui/card";
import { cn } from "@/core/app/components/ui/utils";
import type { UtilityRecord } from "@/core/types/ems";

export function UtilitiesComparisonCard({
  rows,
  getCompanyName,
  className,
}: {
  rows: UtilityRecord[];
  getCompanyName: (id: string) => string;
  className?: string;
}) {
  const topVariance = [...rows]
    .filter((row) => typeof row.variancePercent === "number")
    .sort((a, b) => Math.abs(b.variancePercent ?? 0) - Math.abs(a.variancePercent ?? 0))[0];
  const stableMeters = rows.filter((row) => (row.varianceFlag ?? "normal") === "normal").length;

  return (
    <Card className={cn("shadow-xs", className)}>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Comparison widget</div>
        <div className="text-muted-foreground mt-1 text-sm">
          Compare company meters vs baseline.
        </div>
        {rows.length ? (
          <div className="mt-4 grid gap-2">
            <div className="rounded-lg border p-3 text-sm">
              <div className="text-muted-foreground text-xs">Top variance</div>
              <div className="mt-1 font-medium">
                {topVariance
                  ? `${topVariance.meterName} (${getCompanyName(topVariance.facilityId)})`
                  : "No variance calculated"}
              </div>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <div className="text-muted-foreground text-xs">Stable meters</div>
              <div className="mt-1 font-medium">{stableMeters}</div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground mt-4 rounded-lg border p-3 text-sm">
            No utility records yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
