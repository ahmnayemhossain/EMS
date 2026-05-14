import { Card, CardContent } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { CAPA } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function WastewaterLinkedCapasCard({ capas }: { capas: CAPA[] }) {
  return (
    <Card className="shadow-xs">
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Linked CAPAs</div>
        <div className="mt-4 space-y-3">
          {capas.length ? (
            capas.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {getFacilityName(c.facilityId)} • Due {formatDate(c.dueDate)}
                    </div>
                  </div>
                  <StatusBadge tone={c.severity === "critical" ? "critical" : "warning"}>
                    {c.severity}
                  </StatusBadge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No linked CAPA.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
