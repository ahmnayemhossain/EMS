import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Incident } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function FacilityRecentIncidentsCard({ items }: { items: Incident[] }) {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Recent incidents</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.length ? (
            items.map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{i.title}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {formatDate(i.date)} â€¢ {i.type.replace(/_/g, " ")}
                  </div>
                </div>
                <StatusBadge
                  tone={
                    i.severity === "high"
                      ? "critical"
                      : i.severity === "medium"
                        ? "warning"
                        : "info"
                  }
                >
                  {i.status}
                </StatusBadge>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No incidents recorded.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


