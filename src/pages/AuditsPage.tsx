import * as React from "react";
import { CalendarDays, ClipboardCheck, ShieldCheck } from "lucide-react";

import { audits, facilities, getFacilityName } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";
import { KPIStatCard } from "@/components/KPIStatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { formatDate } from "@/utils/format";
import type { Audit } from "@/types/ems";

export function AuditsPage() {
  const [selected, setSelected] = React.useState<Audit | null>(null);

  const upcoming = audits
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const total = audits.length;
  const inProgress = audits.filter((a) => a.progress > 0 && a.progress < 100).length;
  const criticalFindings = audits.reduce((sum, a) => sum + a.findingsCount.critical, 0);

  const cols: Array<DataColumn<Audit>> = [
    {
      id: "name",
      header: "Audit",
      cell: (a) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{a.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(a.facilityId)} • {formatDate(a.date)}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    {
      id: "progress",
      header: "Checklist",
      cell: (a) => (
        <div className="min-w-[160px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{a.progress}%</span>
          </div>
          <Progress value={a.progress} className="mt-2" />
        </div>
      ),
      className: "min-w-[220px]",
    },
    {
      id: "findings",
      header: "Findings",
      cell: (a) => (
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge tone="neutral">Minor {a.findingsCount.minor}</StatusBadge>
          <StatusBadge tone="warning">Major {a.findingsCount.major}</StatusBadge>
          <StatusBadge tone="critical">Critical {a.findingsCount.critical}</StatusBadge>
        </div>
      ),
      className: "text-right min-w-[260px]",
    },
    {
      id: "score",
      header: "Score",
      cell: (a) => (
        <div className="flex justify-end">
          <StatusBadge tone={a.overallScore >= 85 ? "compliant" : a.overallScore >= 70 ? "warning" : "critical"}>
            {a.overallScore}%
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[120px]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard title="Audits" value={total} icon={ShieldCheck} tone="info" />
        <KPIStatCard title="In progress" value={inProgress} icon={ClipboardCheck} tone={inProgress > 0 ? "warning" : "compliant"} />
        <KPIStatCard title="Critical findings" value={criticalFindings} helper="Across active audits" tone={criticalFindings > 0 ? "critical" : "compliant"} />
        <KPIStatCard title="Factories" value={facilities.length} icon={CalendarDays} tone="neutral" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader>
            <CardTitle>Audit list</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              rows={upcoming}
              columns={cols}
              rowKey={(a) => a.id}
              onRowClick={(row) => setSelected(row)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Upcoming audits</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((a) => (
                <div key={a.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{a.name}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {getFacilityName(a.facilityId)} • {formatDate(a.date)}
                      </div>
                    </div>
                    <StatusBadge tone={a.progress >= 75 ? "compliant" : "warning"}>
                      {a.progress}% ready
                    </StatusBadge>
                  </div>
                </div>
              ))}
              <div className="text-muted-foreground text-xs">
                Widget placeholder; add calendar integration later.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? selected.name : "Audit"}
        description={selected ? `${getFacilityName(selected.facilityId)} • ${formatDate(selected.date)}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Auditor</div>
                <div className="mt-1 text-sm font-medium">{selected.auditor}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Overall score</div>
                <div className="mt-1">
                  <StatusBadge tone={selected.overallScore >= 85 ? "compliant" : selected.overallScore >= 70 ? "warning" : "critical"}>
                    {selected.overallScore}%
                  </StatusBadge>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">Checklist progress</div>
              <div className="mt-2">
                <Progress value={selected.progress} />
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                Wire to real checklist items later.
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">Findings summary</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge tone="neutral">Minor {selected.findingsCount.minor}</StatusBadge>
                <StatusBadge tone="warning">Major {selected.findingsCount.major}</StatusBadge>
                <StatusBadge tone="critical">Critical {selected.findingsCount.critical}</StatusBadge>
              </div>
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
