import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/primitives/card";
import { cn } from "@/components/ui/primitives/utils";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Document } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function ExpiringDocsCard({
  documents,
  className,
}: {
  documents: Document[];
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Expiring permits & documents</div>
        <div className="mt-4 space-y-3">
          {documents.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{d.title}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {d.expiresOn ? `Expires ${formatDate(d.expiresOn)}` : "No expiry date"} â€¢{" "}
                  {d.ownerDepartment}
                </div>
              </div>
              <StatusBadge tone={d.status === "expired" ? "critical" : "warning"}>
                <TriangleAlert className="size-3" />
                {d.status}
              </StatusBadge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


