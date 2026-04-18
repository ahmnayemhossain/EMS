import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DataTable } from "@/components/DataTable";
import type { AuditRecord } from "@/types/audit";
import { AuditDetailPanel } from "./AuditDetailPanel";
import { AuditsKpis } from "./AuditsKpis";
import { AuditsSideCard } from "./AuditsSideCard";
import { getAuditColumns } from "./auditColumns";

export function AuditsOverviewTab({ records }: { records: AuditRecord[] }) {
  const [selected, setSelected] = React.useState<AuditRecord | null>(null);

  const sorted = React.useMemo(() => {
    return records
      .slice()
      .sort((a, b) => {
        const at = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
        const bt = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
        return at - bt;
      });
  }, [records]);

  const total = records.length;
  const inProgress = records.filter((a) => a.progress > 0 && a.progress < 100).length;
  const criticalFindings = records.reduce((sum, a) => sum + a.findingsCount.critical, 0);

  const upcoming = React.useMemo(
    () => sorted.filter((a) => Boolean(a.date) && a.progress < 100).slice(0, 6),
    [sorted],
  );
  const completed = React.useMemo(() => sorted.filter((a) => a.progress >= 100).slice(0, 6), [sorted]);
  const unscheduled = React.useMemo(() => sorted.filter((a) => !a.date).slice(0, 6), [sorted]);

  const columns = React.useMemo(() => getAuditColumns(), []);

  return (
    <div className="space-y-6">
      <AuditsKpis total={total} inProgress={inProgress} criticalFindings={criticalFindings} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader>
            <CardTitle>Audit list</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              rows={sorted}
              columns={columns}
              rowKey={(a) => a.id}
              onRowClick={(row) => setSelected(row)}
              className="hide-scrollbar"
            />
          </CardContent>
        </Card>

        <AuditsSideCard
          upcoming={upcoming}
          completed={completed}
          unscheduled={unscheduled}
          onSelect={(a) => setSelected(a)}
        />
      </div>

      <AuditDetailPanel audit={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

