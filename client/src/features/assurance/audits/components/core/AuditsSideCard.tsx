import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { AuditRecord } from "@/core/types/models/audit";

import { formatAuditDate } from "../../config/audit.helpers";

function AuditMiniRow({
  audit,
  onSelect,
}: {
  audit: AuditRecord;
  onSelect: (audit: AuditRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(audit)}
      className="w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{audit.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {audit.companyName || audit.facilityId} • {formatAuditDate(audit.date)}
          </div>
        </div>
        <StatusBadge
          tone={audit.progress >= 85 ? "compliant" : audit.progress >= 70 ? "warning" : "critical"}
        >
          {audit.progress}%
        </StatusBadge>
      </div>
    </button>
  );
}

export function AuditsSideCard({
  upcoming,
  completed,
  unscheduled,
  onSelect,
}: {
  upcoming: AuditRecord[];
  completed: AuditRecord[];
  unscheduled: AuditRecord[];
  onSelect: (audit: AuditRecord) => void;
}) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Audits</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border bg-muted/30 p-1">
            <TabsTrigger value="upcoming">
              Upcoming <span className="ml-1 text-xs text-muted-foreground">({upcoming.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <span className="ml-1 text-xs text-muted-foreground">({completed.length})</span>
            </TabsTrigger>
            <TabsTrigger value="unscheduled">
              Unscheduled <span className="ml-1 text-xs text-muted-foreground">({unscheduled.length})</span>
            </TabsTrigger>
          </TabsList>

          {([
            { key: "upcoming", list: upcoming },
            { key: "completed", list: completed },
            { key: "unscheduled", list: unscheduled },
          ] as const).map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="m-0 mt-3 space-y-3">
              {tab.list.map((audit) => (
                <AuditMiniRow key={audit.id} audit={audit} onSelect={onSelect} />
              ))}
              {!tab.list.length ? (
                <div className="grid place-items-center rounded-xl border p-6 text-sm text-muted-foreground">
                  No audits
                </div>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
