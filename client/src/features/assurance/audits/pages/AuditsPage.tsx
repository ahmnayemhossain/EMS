import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import type { AuditRecord } from "@/core/types/models/audit";

import { AuditCreateDialog } from "../components/core/AuditCreateDialog";
import { AuditsOverviewTab } from "../components/core/AuditsOverviewTab";
import { createAuditRecordApi, listAuditRecords } from "../services/api";

export function AuditsPage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const [records, setRecords] = React.useState<AuditRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);

  const loadRecords = React.useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const next = await listAuditRecords(userId, selectedCompanyId || undefined);
      setRecords(Array.isArray(next) ? next : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load audits.");
    } finally {
      setLoading(false);
    }
  }, [userId, selectedCompanyId]);

  React.useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <div className="space-y-6">
      <AuditCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        facilities={companies}
        onCreate={async (record) => {
          try {
            const created = await createAuditRecordApi(userId, {
              facilityId: record.facilityId,
              name: record.name,
              customerName: record.customerName,
              date: record.date,
              nextAuditDate: record.nextAuditDate,
              auditor: record.auditor,
              progress: record.progress,
              overallScore: record.overallScore,
              findingsCount: record.findingsCount,
              templateId: record.templateId,
              checklist: record.checklist,
              findings: record.findings,
            });
            setRecords((prev) => [created, ...prev]);
            toast.success("Audit created.");
            return true;
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create audit.");
            return false;
          }
        }}
      />

      {loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Loading audits...</div>
      ) : (
        <AuditsOverviewTab records={records} companyCount={companies.length} />
      )}
    </div>
  );
}
