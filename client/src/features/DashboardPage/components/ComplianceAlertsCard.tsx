import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { cn } from "@/core/app/components/ui/utils";
import { AlertCard } from "@/core/components/AlertCard";
import type { Notification } from "@/core/types/ems";

export function ComplianceAlertsCard({
  items,
  className,
}: {
  items: Notification[];
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardHeader className="pb-2">
        <CardTitle>Compliance alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((n) => (
          <AlertCard
            key={n.id}
            tone={n.tone}
            title={n.title}
            description={n.description}
            meta={<div className="text-muted-foreground text-xs">{n.createdAt}</div>}
          />
        ))}
      </CardContent>
    </Card>
  );
}

