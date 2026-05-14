import { Card, CardContent } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";

export function WastewaterThresholdsCard({
  thresholds,
}: {
  thresholds: { pH: { min: number; max: number }; COD: { max: number }; BOD: { max: number } };
}) {
  return (
    <Card className="shadow-xs">
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Permit thresholds</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">pH</div>
            <div className="mt-1 text-sm font-medium">
              {thresholds.pH.min}–{thresholds.pH.max}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">COD</div>
            <StatusBadge tone="neutral">≤ {thresholds.COD.max} mg/L</StatusBadge>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">BOD</div>
            <StatusBadge tone="neutral">≤ {thresholds.BOD.max} mg/L</StatusBadge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
