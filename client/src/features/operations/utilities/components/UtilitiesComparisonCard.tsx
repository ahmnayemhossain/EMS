import { Card, CardContent } from "@/components/ui/primitives/card";
import { cn } from "@/components/ui/primitives/utils";

export function UtilitiesComparisonCard({
  missingMonthLabels,
  monthWarnings,
  className,
}: {
  missingMonthLabels: string[];
  monthWarnings: Array<{ month: string; detail: string }>;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs", className)}>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Coverage insights</div>
        <div className="text-muted-foreground mt-1 text-sm">
          Missing days and missing months for the selected utility stream.
        </div>
        <div className="mt-4 grid gap-2">
          <div className="rounded-lg border p-3 text-sm">
            <div className="text-muted-foreground text-xs">Missing months</div>
            <div className="mt-1 font-medium">
              {missingMonthLabels.length ? missingMonthLabels.join(", ") : "No missing months"}
            </div>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <div className="text-muted-foreground text-xs">Missing days by month</div>
            {monthWarnings.length ? (
              <div className="mt-2 space-y-2">
                {monthWarnings.slice(0, 4).map((item) => (
                  <div key={item.month} className="rounded-md bg-muted/30 px-2 py-1.5 text-xs">
                    <span className="font-medium">{item.month}</span>
                    <span className="text-muted-foreground"> â€” {item.detail}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-1 font-medium">No missing day issue</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

