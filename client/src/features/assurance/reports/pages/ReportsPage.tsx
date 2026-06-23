import * as React from "react";
import { FileSpreadsheet, Search } from "lucide-react";

import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
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
  getReportCategory,
  type ReportCategoryKey,
  type ReportRow,
  validateReportInputs,
} from "@/features/assurance/reports/utils/report-page-helpers";

type ReportSection = {
  key: ReportCategoryKey;
  label: string;
  description: string;
  defs: ReportDefinition[];
};

export function ReportsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const { userId } = useUser();

  const selectedCompany = React.useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const [defsLoading, setDefsLoading] = React.useState(true);
  const [defs, setDefs] = React.useState<ReportDefinition[]>([]);
  const [reportSearch, setReportSearch] = React.useState("");

  const [activeDef, setActiveDef] = React.useState<ReportDefinition | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const [previewSearch, setPreviewSearch] = React.useState("");
  const [previewRows, setPreviewRows] = React.useState<ReportRow[]>([]);
  const [varValues, setVarValues] = React.useState<Record<string, string>>({});
  const [lastPreviewKey, setLastPreviewKey] = React.useState<string>("");

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

  const filteredDefs = React.useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    if (!query) return defs;

    return defs.filter((def) =>
      [def.name, def.description, def.key].some((value) =>
        String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [defs, reportSearch]);

  const sections = React.useMemo<ReportSection[]>(() => {
    const map = new Map<ReportCategoryKey, ReportSection>();

    for (const def of filteredDefs) {
      const category = getReportCategory(def);
      if (!map.has(category.key)) {
        map.set(category.key, { ...category, defs: [] });
      }
      map.get(category.key)?.defs.push(def);
    }

    return [
      map.get("master"),
      map.get("reference"),
      map.get("records"),
      map.get("approved"),
      map.get("exceptions"),
    ].filter((section): section is ReportSection => Boolean(section?.defs.length));
  }, [filteredDefs]);

  function resetPreviewState() {
    setPreviewOpen(false);
    setActiveDef(null);
    setPreviewRows([]);
    setPreviewSearch("");
    setLastPreviewKey("");
  }

  function openPreview(def: ReportDefinition) {
    const defaults = getDefaultVarValues(def, selectedCompanyId);
    setActiveDef(def);
    setVarValues(defaults);
    setPreviewRows([]);
    setPreviewSearch("");
    setLastPreviewKey("");
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
      setLastPreviewKey("");
      return;
    }

    setPreviewLoading(true);
    try {
      const payload = buildRunPayload(def, resolvedVars, selectedCompanyId);
      const result = await runReport(userId, def.key, payload);
      const rows = Array.isArray(result?.rows) ? result.rows : [];
      setPreviewRows(rows);
      setLastPreviewKey(def.key);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load preview.");
      setPreviewRows([]);
      setLastPreviewKey("");
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

  const scopedCount = defs.filter((def) => def.requiresCompany).length;

  return (
    <div className="space-y-4">
      <SectionCard
        title="Reports"
        description="Run the report first, verify the preview, then export the final CSV."
      >
        <div className="grid gap-3 px-4 pt-2 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={reportSearch}
              onChange={(event) => setReportSearch(event.target.value)}
              placeholder="Search reports by name, key, or description..."
              className="h-10 pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:min-w-[280px]">
            <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Active reports</div>
              <div className="mt-1 text-xl font-semibold">{defs.length}</div>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Company scoped</div>
              <div className="mt-1 text-xl font-semibold">{scopedCount}</div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{selectedCompany ? selectedCompany.name : "No company selected"}</Badge>
            <span>Reports are grouped by purpose so preview and export stay clear.</span>
          </div>
        </div>

        {defsLoading ? <div className="p-4 text-sm text-muted-foreground">Loading reports from database...</div> : null}
        {!defsLoading && filteredDefs.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No report definitions found.</div>
        ) : null}

        {!defsLoading && sections.length ? (
          <div className="space-y-5 px-4 pb-6 pt-3 sm:px-6">
            {sections.map((section) => (
              <div key={section.key} className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold tracking-tight">{section.label}</h3>
                    <Badge variant="secondary">{section.defs.length}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.defs.map((def) => (
                    <ReportGridCard
                      key={def.key}
                      def={def}
                      previewLoading={previewLoading}
                      activeKey={activeDef?.key}
                      onPreview={openPreview}
                    />
                  ))}
                </div>
              </div>
            ))}
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
