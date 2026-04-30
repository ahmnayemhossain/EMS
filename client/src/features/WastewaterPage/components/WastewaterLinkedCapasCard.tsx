import * as React from "react";
import { Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { StatusBadge } from "@/core/components/StatusBadge";
import { getFacilityName } from "@/core/data/mock";
import type { CapaAction } from "@/core/types/ems";
import { formatDate } from "@/core/utils/format";

export function WastewaterLinkedCapasCard({ items }: { items: CapaAction[] }) {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-4" />
          Linked CAPA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.title}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {getFacilityName(c.facilityId)} • Due {formatDate(c.dueDate)}
                  </div>
                </div>
                <StatusBadge
                  tone={
                    c.status === "overdue"
                      ? "critical"
                      : c.status === "open"
                        ? "warning"
                        : "info"
                  }
                >
                  {c.status}
                </StatusBadge>
              </div>
            </div>
          ))}
          {!items.length ? (
            <div className="text-muted-foreground text-sm">No linked CAPA.</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

