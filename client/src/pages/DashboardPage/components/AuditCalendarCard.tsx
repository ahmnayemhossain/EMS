import * as React from "react";

import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";

export function AuditCalendarCard({
  selectedDate,
  className,
}: {
  selectedDate: Date;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardHeader className="pb-2">
        <CardTitle>Audit calendar</CardTitle>
        <div className="text-muted-foreground text-sm">Placeholder widget</div>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar mode="single" selected={selectedDate} />
      </CardContent>
    </Card>
  );
}

