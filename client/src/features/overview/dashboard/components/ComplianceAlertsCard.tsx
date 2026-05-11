import * as React from "react";

import { Card, CardContent } from "@/components/ui/primitives/card";
import { cn } from "@/components/ui/primitives/utils";
import { AlertCard } from "@/components/feedback/AlertCard";
import type { Notification } from "@/core/types/models/ems";

export function ComplianceAlertsCard({
  items,
  className,
}: {
  items: Notification[];
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Compliance alerts</div>
        <div className="mt-4 space-y-3">
          {items.map((n) => (
            <AlertCard
              key={n.id}
              tone={n.tone}
              title={n.title}
              description={n.description}
              meta={<div className="text-muted-foreground text-xs">{n.createdAt}</div>}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

