import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Card, CardContent } from "@/components/ui/primitives/card";

export function WastewaterThresholdsCard({
  thresholds,
}: {
  thresholds: { pH: { min: number; max: number }; COD: { max: number }; BOD: { max: number } };
}) {
  return (
    <Card className="shadow-xs">
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Permit thresholds</div>
        <div className="text-muted-foreground mt-1 text-sm">
          Quick reference for outlet comparison.
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="text-muted-foreground text-xs">pH</div>
            <div className="mt-1 text-sm font-semibold">
              {thresholds.pH.min}–{thresholds.pH.max}
            </div>
          </div>
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="text-muted-foreground text-xs">COD</div>
            <StatusBadge tone="neutral">≤ {thresholds.COD.max} mg/L</StatusBadge>
          </div>
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="text-muted-foreground text-xs">BOD</div>
            <StatusBadge tone="neutral">≤ {thresholds.BOD.max} mg/L</StatusBadge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
