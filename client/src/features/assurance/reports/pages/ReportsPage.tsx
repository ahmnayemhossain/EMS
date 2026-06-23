import * as React from "react";

import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { Badge } from "@/components/ui/primitives/badge";
import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import { ReportGridCard } from "@/features/assurance/reports/components/ReportGridCard";
import { ReportPreviewDialog } from "@/features/assurance/reports/components/ReportPreviewDialog";
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

export function ReportsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const { userId } = useUser();

  const selectedCompany = React.useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

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
      if (!userId) return;

      setDefsLoading(true);
      try {
        const list = await listReportDefinitions(userId);
        if (!cancelled) setDefs(Array.isArray(list) ? list : []);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Failed to load reports.");
      } finally {
        if (!cancelled) setDefsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const utilityMasterReport = defs[0] ?? null;

  function resetPreviewState() {
    setPreviewOpen(false);
    setActiveDef(null);
    setPreviewRows([]);
    setPreviewSearch("");
  }

  function openPreview(def: ReportDefinition) {
    const defaults = getDefaultVarValues(def, selectedCompanyId);
    setActiveDef(def);
    setVarValues(defaults);
    setPreviewRows([]);
    setPreviewSearch("");
    setPreviewOpen(true);
    void loadPreview(def, defaults);
  }

  async function loadPreview(def: ReportDefinition, nextVars?: Record<string, string>) {
    if (!userId) return;

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
  }

  async function handleExport(def: ReportDefinition) {
    if (!userId) return;

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
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Utility Master Report"
        description="Single production report for utility master setup and meter reference data."
      >
        <div className="px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{selectedCompany ? selectedCompany.name : "No company selected"}</Badge>
            <span>Preview first, then export the final CSV.</span>
          </div>
        </div>

        {defsLoading ? <div className="p-4 text-sm text-muted-foreground">Loading reports from database...</div> : null}
        {!defsLoading && !utilityMasterReport ? (
          <div className="p-4 text-sm text-muted-foreground">Utility master report is not available.</div>
        ) : null}

        {!defsLoading && utilityMasterReport ? (
          <div className="px-4 pb-6 pt-3 sm:px-6">
            <div className="grid gap-4 md:max-w-[540px]">
              <ReportGridCard
                def={utilityMasterReport}
                previewLoading={previewLoading}
                activeKey={activeDef?.key}
                onPreview={openPreview}
              />
            </div>
          </div>
        ) : null}
      </SectionCard>

      <ReportPreviewDialog
        open={previewOpen}
        activeDef={activeDef}
        selectedCompanyName={selectedCompany?.name}
        previewLoading={previewLoading}
        exporting={exporting}
        previewSearch={previewSearch}
        previewRows={previewRows}
        varValues={varValues}
        onOpenChange={setPreviewOpen}
        onPreviewSearchChange={setPreviewSearch}
        onVarValueChange={(name, value) => setVarValues((prev) => ({ ...prev, [name]: value }))}
        onRefresh={() => activeDef && void loadPreview(activeDef)}
        onExport={() => activeDef && void handleExport(activeDef)}
        onCloseReset={resetPreviewState}
      />
    </div>
  );
}
