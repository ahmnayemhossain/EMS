import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";

export function WasteSegregationCard() {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Segregation status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Hazardous labeled</span>
            <StatusBadge tone="warning">Partial</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>Recyclables separated</span>
            <StatusBadge tone="compliant">Good</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>Storage area housekeeping</span>
            <StatusBadge tone="info">Monitor</StatusBadge>
          </div>
          <div className="text-muted-foreground text-xs">
            Widget placeholder; wire to inspection checklist later.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


