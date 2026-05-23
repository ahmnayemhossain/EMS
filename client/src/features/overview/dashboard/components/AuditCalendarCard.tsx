import * as React from "react";

import { Calendar } from "@/components/ui/primitives/calendar";
import { Card, CardContent } from "@/components/ui/primitives/card";
import { cn } from "@/components/ui/primitives/utils";

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
        <div className="mt-4">
          <Calendar mode="single" selected={selectedDate} />
        </div>
      </CardContent>
    </Card>
  );
}

