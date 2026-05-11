import * as React from "react";
import { FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Document } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function FacilityDocumentExpiryCard({ items }: { items: Document[] }) {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Document expiry</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.length ? (
            items.map((d) => (
              <div key={d.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.title}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    <FileText className="mr-1 inline size-3" />
                    {d.expiresOn ? `Expires ${formatDate(d.expiresOn)}` : "No expiry"}
                  </div>
                </div>
                <StatusBadge
                  tone={
                    d.status === "expired"
                      ? "critical"
                      : d.status === "expiring"
                        ? "warning"
                        : "compliant"
                  }
                >
                  {d.status}
                </StatusBadge>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No documents linked.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


