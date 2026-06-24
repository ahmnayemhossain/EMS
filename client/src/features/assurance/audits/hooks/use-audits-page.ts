import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { AuditRecord } from "@/core/types/models/audit";

import { createAuditRecordApi, listAuditRecords } from "@/features/assurance/audits/services/api";

type AuditCreateInput = {
  facilityId: string;
  name: string;
  customerName?: string;
  date: string;
  nextAuditDate?: string;
  auditor: string;
  progress: number;
  overallScore: number;
  findingsCount: number;
  templateId?: string;
  checklist?: unknown;
  findings?: unknown;
};

export function useAuditsPage(selectedCompanyId?: string) {
  const { userId } = useUser();
  const [records, setRecords] = React.useState<AuditRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);

  const loadRecords = React.useCallback(async () => {
    if (!userId) {
      return [];
    }

    try {
      setLoading(true);
      const next = await listAuditRecords(userId, selectedCompanyId);
      const safeRows = Array.isArray(next) ? next : [];
      setRecords(safeRows);
      return safeRows;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load audits.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, selectedCompanyId]);

  React.useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const createRecord = React.useCallback(
    async (record: AuditCreateInput) => {
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
    },
    [userId],
  );

  return {
    records,
    loading,
    createOpen,
    setCreateOpen,
    reload: loadRecords,
    createRecord,
  };
}
