import * as React from "react";
import { CalendarClock, ClipboardList, Paperclip } from "lucide-react";

import { capas, getFacilityName } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import type { CAPA } from "@/types/ems";

type BoardColumn = {
  id: CAPA["status"];
  title: string;
  tone: "neutral" | "info" | "warning" | "critical" | "compliant";
};

const columns: BoardColumn[] = [
  { id: "open", title: "Open", tone: "warning" },
  { id: "in_progress", title: "In Progress", tone: "info" },
  { id: "pending_verification", title: "Pending Verification", tone: "neutral" },
  { id: "closed", title: "Closed", tone: "compliant" },
  { id: "overdue", title: "Overdue", tone: "critical" },
];

function severityTone(sev: CAPA["severity"]) {
  if (sev === "critical") return "critical";
  if (sev === "major") return "warning";
  return "neutral";
}

export function CapaPage() {
  const byStatus = new Map<CAPA["status"], CAPA[]>();
  for (const c of capas) {
    const list = byStatus.get(c.status) ?? [];
    list.push(c);
    byStatus.set(c.status, list);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((col) => {
          const items = byStatus.get(col.id) ?? [];
          return (
            <Card key={col.id} className="shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{col.title}</CardTitle>
                  <StatusBadge tone={col.tone}>{items.length}</StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {items.map((c) => (
                  <div key={c.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.title}</div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {c.owner} • {getFacilityName(c.facilityId)}
                        </div>
                      </div>
                      <StatusBadge tone={severityTone(c.severity)}>{c.severity}</StatusBadge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                      <div className="text-muted-foreground flex items-center gap-1">
                        <CalendarClock className="size-3" />
                        Due {formatDate(c.dueDate)}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Paperclip className="size-3" />
                        {c.evidenceCount}
                      </div>
                    </div>
                  </div>
                ))}
                {!items.length ? (
                  <div className="text-muted-foreground grid place-items-center rounded-xl border border-dashed p-6 text-sm">
                    <ClipboardList className="mb-2 size-5" />
                    No items
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
