import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";

export function UtilitiesComparisonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("shadow-xs", className)}>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Comparison widget</div>
        <div className="text-muted-foreground mt-1 text-sm">
          Compare factory meters vs baseline (placeholder).
        </div>
        <div className="mt-4 grid gap-2">
          <div className="rounded-lg border p-3 text-sm">
            <div className="text-muted-foreground text-xs">Top variance</div>
            <div className="mt-1 font-medium">Process water line (GS-D)</div>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <div className="text-muted-foreground text-xs">Stable meters</div>
            <div className="mt-1 font-medium">Production floor (GS-S)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
