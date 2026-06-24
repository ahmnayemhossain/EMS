import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import {
  exportReportCsv,
  listReportDefinitions,
  runReport,
  type ReportDefinition,
} from "@/features/assurance/reports/services/api";
import { downloadBlobFile } from "@/features/assurance/reports/utils/download-blob-file";
import {
  buildRunPayload,
  getDefaultVarValues,
  type ReportRow,
  validateReportInputs,
} from "@/features/assurance/reports/utils/report-page-helpers";

export function useReportsPage(selectedCompanyId: string | null) {
  const { userId } = useUser();
  const [defsLoading, setDefsLoading] = React.useState(true);
  const [defs, setDefs] = React.useState<ReportDefinition[]>([]);
  const [activeDef, setActiveDef] = React.useState<ReportDefinition | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [previewSearch, setPreviewSearch] = React.useState("");
  const [previewRows, setPreviewRows] = React.useState<ReportRow[]>([]);
  const [varValues, setVarValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        return;
      }

      setDefsLoading(true);
      try {
        const list = await listReportDefinitions(userId);
        if (!cancelled) {
          setDefs(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load reports.");
        }
      } finally {
        if (!cancelled) {
          setDefsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const utilityMasterReport = defs[0] ?? null;

  const resetPreviewState = React.useCallback(() => {
    setPreviewOpen(false);
    setActiveDef(null);
    setPreviewRows([]);
    setPreviewSearch("");
  }, []);

  const loadPreview = React.useCallback(
    async (def: ReportDefinition, nextVars?: Record<string, string>) => {
      if (!userId) {
        return;
      }

      const resolvedVars = nextVars ?? varValues;
      const validationError = validateReportInputs(def, resolvedVars, selectedCompanyId);
      if (validationError) {
        toast.error(validationError);
        setPreviewRows([]);
        return;
      }

      setPreviewLoading(true);
      try {
        const payload = buildRunPayload(def, resolvedVars, selectedCompanyId);
        const result = await runReport(userId, def.key, payload);
        const rows = Array.isArray(result?.rows) ? result.rows : [];
        setPreviewRows(rows);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load preview.");
        setPreviewRows([]);
      } finally {
        setPreviewLoading(false);
      }
    },
    [selectedCompanyId, userId, varValues],
  );

  const openPreview = React.useCallback(
    (def: ReportDefinition) => {
      const defaults = getDefaultVarValues(def, selectedCompanyId);
      setActiveDef(def);
      setVarValues(defaults);
      setPreviewRows([]);
      setPreviewSearch("");
      setPreviewOpen(true);
      void loadPreview(def, defaults);
    },
    [loadPreview, selectedCompanyId],
  );

  const exportActiveReport = React.useCallback(
    async (def: ReportDefinition) => {
      if (!userId) {
        return;
      }

      const validationError = validateReportInputs(def, varValues, selectedCompanyId);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setExporting(true);
      try {
        const payload = buildRunPayload(def, varValues, selectedCompanyId);
        const result = await exportReportCsv(userId, def.key, payload);
        downloadBlobFile(result.blob, result.filename);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to export report.");
      } finally {
        setExporting(false);
      }
    },
    [selectedCompanyId, userId, varValues],
  );

  return {
    defsLoading,
    utilityMasterReport,
    activeDef,
    previewOpen,
    setPreviewOpen,
    previewLoading,
    exporting,
    previewSearch,
    setPreviewSearch,
    previewRows,
    varValues,
    setVarValues,
    resetPreviewState,
    openPreview,
    loadPreview,
    exportActiveReport,
  };
}
