import * as React from "react";

import { Calendar } from "@/core/app/components/ui/calendar";
import { Card, CardContent } from "@/core/app/components/ui/card";
import { cn } from "@/core/app/components/ui/utils";

export function AuditCalendarCard({
  selectedDate,
  className,
}: {
  selectedDate: Date;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Audit calendar</div>
        <div className="text-muted-foreground mt-1 text-sm">Placeholder widget</div>
        <div className="mt-4">
          <Calendar mode="single" selected={selectedDate} />
        </div>
      </CardContent>
    </Card>
  );
}
