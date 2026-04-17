import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import { StatusBadge } from "@/components/StatusBadge";
import type { Document } from "@/types/ems";
import { formatDate } from "@/utils/format";

export function ExpiringDocsCard({
  documents,
  className,
}: {
  documents: Document[];
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardHeader>
        <CardTitle>Expiring permits & documents</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {documents.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{d.title}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {d.expiresOn ? `Expires ${formatDate(d.expiresOn)}` : "No expiry date"} •{" "}
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

