import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export function WastewaterThresholdsCard({
  thresholds,
}: {
  thresholds: {
    pH: { min: number; max: number };
    COD: { max: number };
    BOD: { max: number };
  };
}) {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Thresholds</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>pH</span>
            <StatusBadge tone="neutral">
              {thresholds.pH.min}–{thresholds.pH.max}
            </StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>COD</span>
            <StatusBadge tone="neutral">≤ {thresholds.COD.max} mg/L</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>BOD</span>
            <StatusBadge tone="neutral">≤ {thresholds.BOD.max} mg/L</StatusBadge>
          </div>
          <div className="text-muted-foreground text-xs">
            Threshold panel placeholder; make company-specific later.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

