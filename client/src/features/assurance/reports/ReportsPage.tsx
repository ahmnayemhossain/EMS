import * as React from "react";
import { Download, Eye, FileSpreadsheet, LayoutGrid, List, RefreshCcw, Search } from "lucide-react";

import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives/dialog";
import { Input } from "@/components/ui/primitives/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/primitives/table";
import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { downloadTextFile } from "@/features/assurance/reports/download-text-file";
import { listReportDefinitions, runReport, type ReportDefinition, type ReportVariableDef } from "@/features/assurance/reports/api";

type ReportRow = Record<string, unknown>;
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

  const filteredPreviewRows = React.useMemo(() => {
    const query = previewSearch.trim().toLowerCase();
    if (!query) return previewRows;
    return previewRows.filter((row) =>
      Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [previewRows, previewSearch]);

  const previewColumns = React.useMemo(() => getColumnKeys(filteredPreviewRows), [filteredPreviewRows]);

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

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setActiveDef(null);
            setPreviewRows([]);
            setPreviewSearch("");
            setLastPreviewKey("");
          }
        }}
      >
        <DialogContent className="flex max-h-[88vh] flex-col overflow-hidden sm:max-w-4xl lg:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{activeDef ? `${activeDef.name} preview` : "Report preview"}</DialogTitle>
            <DialogDescription>
              {activeDef?.requiresCompany && selectedCompany?.name ? `${selectedCompany.name} | ` : ""}
              {previewLoading ? "Loading..." : `${filteredPreviewRows.length} row(s)`}
            </DialogDescription>
          </DialogHeader>

          <div className="shrink-0 grid gap-4">
            {activeDef?.requiresCompany ? (
              <div className="grid gap-1.5">
                <div className="text-sm font-medium">Company</div>
                <Input value={selectedCompany?.name ?? ""} readOnly placeholder="Select company" />
              </div>
            ) : null}

            {(activeDef?.variables || []).filter((variable) => variable.name !== "companyId").length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(activeDef?.variables || [])
                  .filter((variable) => variable.name !== "companyId")
                  .map((variable) => (
                    <div key={variable.name} className="grid gap-1.5">
                      <div className="text-sm font-medium">{variable.label || variable.name}</div>
                      <Input
                        type={getInputType(variable)}
                        value={varValues[variable.name] ?? ""}
                        onChange={(event) => setVarValues((prev) => ({ ...prev, [variable.name]: event.target.value }))}
                        placeholder={getInputPlaceholder(variable)}
                      />
                    </div>
                  ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={previewSearch}
                onChange={(event) => setPreviewSearch(event.target.value)}
                placeholder="Search preview..."
              />
              <Button
                variant="outline"
                onClick={() => activeDef && void loadPreview(activeDef)}
                disabled={!activeDef || previewLoading}
              >
                <RefreshCcw className="mr-2 size-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 rounded-lg border border-border/70 bg-card/40">
            <div className="h-full overflow-auto">
              <Table className="[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-background/95">
                <TableHeader>
                  <TableRow>
                    {previewColumns.length ? (
                      previewColumns.map((col) => <TableHead key={col}>{col}</TableHead>)
                    ) : (
                      <TableHead>Result</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewLoading ? (
                    <TableRow>
                      <TableCell colSpan={Math.max(1, previewColumns.length)} className="py-10 text-center text-muted-foreground">
                        Loading preview...
                      </TableCell>
                    </TableRow>
                  ) : filteredPreviewRows.length ? (
                    filteredPreviewRows.map((row, index) => (
                      <TableRow key={String(row.id ?? `${index}`)}>
                        {previewColumns.map((col) => (
                          <TableCell key={`${index}_${col}`}>{formatCellValue(row?.[col])}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={Math.max(1, previewColumns.length)} className="py-10 text-center text-muted-foreground">
                        No rows to preview.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => activeDef && void handleExportCsv(activeDef)} disabled={!activeDef || exporting || previewLoading}>
              <Download className="mr-2 size-4" />
              {exporting ? "Exporting..." : "Download CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportGridCard(input: {
  def: ReportDefinition;
  previewLoading: boolean;
  activeKey?: string;
  onPreview: (def: ReportDefinition) => void;
}) {
  const variableCount = (input.def.variables || []).filter((item) => item.name !== "companyId").length;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <span className="truncate">{input.def.name}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2">{input.def.description || "No description"}</CardDescription>
          </div>
          <Badge variant="outline">{input.def.requiresCompany ? "Company" : "Global"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">
            {variableCount} variable{variableCount === 1 ? "" : "s"}
          </Badge>
          <Badge variant="secondary">Key: {input.def.key}</Badge>
        </div>
        <Button
          className="w-full"
          onClick={() => input.onPreview(input.def)}
          disabled={input.previewLoading && input.activeKey === input.def.key}
        >
          <Eye className="mr-2 size-4" />
          Preview report
        </Button>
      </CardContent>
    </Card>
  );
}

function buildRunPayload(def: ReportDefinition, values: Record<string, string>, selectedCompanyId?: string) {
  const payload: Record<string, unknown> = {};

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name) continue;
    if (name === "companyId") {
      payload.companyId = selectedCompanyId ?? values.companyId ?? "";
      continue;
    }
    payload[name] = values[name] ?? "";
  }

  if (def.requiresCompany) payload.companyId = selectedCompanyId ?? values.companyId ?? "";
  return payload;
}

function validateReportInputs(def: ReportDefinition, values: Record<string, string>, selectedCompanyId?: string) {
  if (def.requiresCompany && !selectedCompanyId) return "Select a company first.";

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name || name === "companyId") continue;
    if (variable.required && !String(values[name] ?? "").trim()) {
      return `${variable.label || name} is required.`;
    }
  }

  return "";
}

function getDefaultVarValues(def: ReportDefinition | null, selectedCompanyId?: string) {
  const base: Record<string, string> = {};
  if (!def) return base;

  for (const variable of def.variables || []) {
    const name = String(variable?.name || "").trim();
    if (!name) continue;

    if (name === "companyId") {
      base.companyId = selectedCompanyId || "";
      continue;
    }

    const explicitValue = variable.defaultValue != null ? String(variable.defaultValue) : "";
    if (explicitValue) {
      base[name] = explicitValue;
      continue;
    }

    if (variable.type === "date") {
      if (/from/i.test(name)) {
        base[name] = getMonthStartDate();
        continue;
      }
      if (/to/i.test(name) || /end/i.test(name)) {
        base[name] = getTodayDate();
        continue;
      }
    }

    base[name] = "";
  }

  return base;
}

function getInputType(variable: ReportVariableDef) {
  if (variable.type === "date") return "date";
  if (variable.type === "number") return "number";
  return "text";
}

function getInputPlaceholder(variable: ReportVariableDef) {
  if (variable.type === "date") return "YYYY-MM-DD";
  if (variable.type === "number") return "0";
  return "Value";
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStartDate() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function formatCellValue(value: unknown) {
  if (value == null || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function getColumnKeys(rows: ReportRow[]) {
  const first = rows[0];
  if (!first || typeof first !== "object") return [];
  return Object.keys(first);
}

