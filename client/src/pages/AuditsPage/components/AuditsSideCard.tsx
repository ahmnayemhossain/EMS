import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";
import type { AuditRecord } from "@/types/audit";
import { formatAuditDate } from "../audit.helpers";

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
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(audit.facilityId)} • {formatAuditDate(audit.date)}
          </div>
        </div>
        <StatusBadge
          tone={
            audit.progress >= 85 ? "compliant" : audit.progress >= 70 ? "warning" : "critical"
          }
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
          <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1">
            <TabsTrigger value="upcoming">
              Upcoming <span className="text-muted-foreground ml-1 text-xs">({upcoming.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <span className="text-muted-foreground ml-1 text-xs">({completed.length})</span>
            </TabsTrigger>
            <TabsTrigger value="unscheduled">
              Unscheduled <span className="text-muted-foreground ml-1 text-xs">({unscheduled.length})</span>
            </TabsTrigger>
          </TabsList>

          {(
            [
              { key: "upcoming", list: upcoming },
              { key: "completed", list: completed },
              { key: "unscheduled", list: unscheduled },
            ] as const
          ).map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-3 m-0 space-y-3">
              {tab.list.map((a) => (
                <AuditMiniRow key={a.id} audit={a} onSelect={onSelect} />
              ))}
              {!tab.list.length ? (
                <div className="text-muted-foreground grid place-items-center rounded-xl border p-6 text-sm">
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

