import * as React from "react";
import { Eye, FileSpreadsheet, LayoutGrid, List, Search } from "lucide-react";

import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { CardDescription } from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/primitives/table";
import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { ReportGridCard } from "@/features/assurance/reports/components/ReportGridCard";
import { ReportPreviewDialog } from "@/features/assurance/reports/components/ReportPreviewDialog";
import { listReportDefinitions, runReport, type ReportDefinition } from "@/features/assurance/reports/services/api";
import { downloadTextFile } from "@/features/assurance/reports/utils/download-text-file";
import { buildRunPayload, escapeCsv, getColumnKeys, getDefaultVarValues, type ReportRow, validateReportInputs } from "@/features/assurance/reports/utils/report-page-helpers";
type ReportView = "grid" | "list";

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
  const [reportView, setReportView] = React.useState<ReportView>("grid");

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

  async function handleExportCsv(def: ReportDefinition) {
    if (!userId) return;

    const validationError = validateReportInputs(def, varValues, selectedCompanyId);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setExporting(true);
    try {
      const rows =
        lastPreviewKey === def.key
          ? previewRows
          : (await runReport(userId, def.key, buildRunPayload(def, varValues, selectedCompanyId))).rows;
      const safeRows = Array.isArray(rows) ? rows : [];
      const headers = getColumnKeys(safeRows);
      if (!headers.length) {
        toast.error("No rows found for export.");
        return;
      }
      const csvHeader = headers.map(escapeCsv).join(",");
      const csvBody = safeRows.map((row) => headers.map((key) => escapeCsv(row?.[key] ?? "")).join(","));
      downloadTextFile([csvHeader, ...csvBody].join("\n"), `${def.key}.csv`, "text/csv;charset=utf-8");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  }

  const filteredDefs = React.useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    if (!query) return defs;
    return defs.filter((def) =>
      [def.name, def.description, def.key].some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [defs, reportSearch]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Reports"
        description="Preview database reports first, then export CSV from the preview window."
      >
        <div className="px-4 pt-2 sm:px-6">
          <div className="flex flex-col gap-2 rounded-2xl border bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={reportSearch}
                onChange={(event) => setReportSearch(event.target.value)}
                placeholder="Search report name..."
                className="h-8 border-0 bg-background/80 pl-9 shadow-none"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 rounded-full"
                aria-label={reportView === "grid" ? "Switch to list view" : "Switch to grid view"}
                onClick={() => setReportView((current) => (current === "grid" ? "list" : "grid"))}
              >
                {reportView === "grid" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
              </Button>
            </div>
          </div>
        </div>

        {defsLoading ? <div className="p-4 text-sm text-muted-foreground">Loading reports from database...</div> : null}
        {!defsLoading && filteredDefs.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No report definitions found.</div> : null}

        {!defsLoading && filteredDefs.length ? (
          reportView === "grid" ? (
            <div className="grid gap-4 px-4 pb-6 pt-1 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDefs.map((def) => (
                <ReportGridCard
                  key={def.key}
                  def={def}
                  previewLoading={previewLoading}
                  activeKey={activeDef?.key}
                  onPreview={openPreview}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 pb-6 pt-1 sm:px-6">
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Variables</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDefs.map((def) => {
                      const variableCount = (def.variables || []).filter((item) => item.name !== "companyId").length;
                      return (
                        <TableRow key={def.key}>
                          <TableCell className="min-w-[360px]">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-medium">
                                <FileSpreadsheet className="text-muted-foreground size-4" />
                                <span className="truncate">{def.name}</span>
                              </div>
                              <div className="text-muted-foreground mt-1 text-xs">{def.description || "No description"}</div>
                              <div className="text-muted-foreground mt-1 text-xs">Key: {def.key}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{def.requiresCompany ? "Company" : "Global"}</Badge>
                          </TableCell>
                          <TableCell>{variableCount}</TableCell>
                          <TableCell className="text-right">
                            <Button onClick={() => openPreview(def)} disabled={previewLoading && activeDef?.key === def.key}>
                              <Eye className="mr-2 size-4" />
                              Preview
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
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
        onExport={() => activeDef && void handleExportCsv(activeDef)}
        onCloseReset={() => {
          setPreviewOpen(false);
          setActiveDef(null);
          setPreviewRows([]);
          setPreviewSearch("");
          setLastPreviewKey("");
        }}
      />
    </div>
  );
}

