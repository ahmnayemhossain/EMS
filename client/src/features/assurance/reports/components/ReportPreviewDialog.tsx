import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives/dialog";
import { Input } from "@/components/ui/primitives/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/primitives/table";
import type { ReportDefinition } from "@/features/assurance/reports/services/api";
import { formatCellValue, getColumnKeys, getInputPlaceholder, getInputType, type ReportRow } from "@/features/assurance/reports/utils/report-page-helpers";

export function ReportPreviewDialog(props: {
  open: boolean;
  activeDef: ReportDefinition | null;
  selectedCompanyName?: string;
  previewLoading: boolean;
  exporting: boolean;
  previewSearch: string;
  previewRows: ReportRow[];
  varValues: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onPreviewSearchChange: (value: string) => void;
  onVarValueChange: (name: string, value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onCloseReset: () => void;
}) {
  const filteredPreviewRows = props.previewSearch.trim().toLowerCase()
    ? props.previewRows.filter((row) => Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(props.previewSearch.trim().toLowerCase())))
    : props.previewRows;
  const previewColumns = getColumnKeys(filteredPreviewRows);

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        props.onOpenChange(open);
        if (!open) props.onCloseReset();
      }}
    >
      <DialogContent className="flex max-h-[88vh] flex-col overflow-hidden sm:max-w-4xl lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{props.activeDef ? `${props.activeDef.name} preview` : "Report preview"}</DialogTitle>
          <DialogDescription>
            {props.activeDef?.requiresCompany && props.selectedCompanyName ? `${props.selectedCompanyName} | ` : ""}
            {props.previewLoading ? "Loading..." : `${filteredPreviewRows.length} row(s)`}
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 grid gap-4">
          {props.activeDef?.requiresCompany ? (
            <div className="grid gap-1.5">
              <div className="text-sm font-medium">Company</div>
              <Input value={props.selectedCompanyName ?? ""} readOnly placeholder="Select company" />
            </div>
          ) : null}

          {(props.activeDef?.variables || []).filter((variable) => variable.name !== "companyId").length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(props.activeDef?.variables || [])
                .filter((variable) => variable.name !== "companyId")
                .map((variable) => (
                  <div key={variable.name} className="grid gap-1.5">
                    <div className="text-sm font-medium">{variable.label || variable.name}</div>
                    <Input
                      type={getInputType(variable)}
                      value={props.varValues[variable.name] ?? ""}
                      onChange={(event) => props.onVarValueChange(variable.name, event.target.value)}
                      placeholder={getInputPlaceholder(variable)}
                    />
                  </div>
                ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={props.previewSearch}
              onChange={(event) => props.onPreviewSearchChange(event.target.value)}
              placeholder="Search preview..."
            />
            <Button variant="outline" onClick={props.onRefresh} disabled={!props.activeDef || props.previewLoading}>
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
                  {previewColumns.length ? previewColumns.map((col) => <TableHead key={col}>{col}</TableHead>) : <TableHead>Result</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.previewLoading ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(1, previewColumns.length)} className="py-10 text-center text-muted-foreground">
                      Loading preview...
                    </TableCell>
                  </TableRow>
                ) : filteredPreviewRows.length ? (
                  filteredPreviewRows.map((row, index) => (
                    <TableRow key={String(row.id ?? `${index}`)}>
                      {previewColumns.map((col) => <TableCell key={`${index}_${col}`}>{formatCellValue(row?.[col])}</TableCell>)}
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
          <Button variant="outline" onClick={props.onCloseReset}>Close</Button>
          <Button onClick={props.onExport} disabled={!props.activeDef || props.exporting || props.previewLoading}>
            <Download className="mr-2 size-4" />
            {props.exporting ? "Exporting..." : "Download CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
