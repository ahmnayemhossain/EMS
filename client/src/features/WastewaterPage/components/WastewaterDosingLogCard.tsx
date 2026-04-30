import * as React from "react";
import { FlaskConical, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { StatusBadge } from "@/core/components/StatusBadge";

export function WastewaterDosingLogCard() {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-4" />
          Dosing log
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-muted-foreground text-sm">
          Placeholder for daily dosing inputs, chemical consumption, and operator sign-off.
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="text-sm font-medium">Today</div>
          <StatusBadge tone="warning">
            <TriangleAlert className="size-3" />
            Pending entry
          </StatusBadge>
        </div>
      </CardContent>
    </Card>
  );
}

