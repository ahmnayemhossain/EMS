import { AlertTriangle, FileWarning, XCircle } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives/dialog";
import type { SdsCsvValidationIssue } from "../utils/csv";

export function SdsImportValidationDialog({
  open,
  onOpenChange,
  fileName,
  issues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName?: string;
  issues: SdsCsvValidationIssue[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,820px)] rounded-2xl border border-rose-500/20 bg-background/95 p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600">
              <FileWarning className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold">CSV validation issues found</DialogTitle>
              <DialogDescription className="text-sm leading-6">
                {fileName ? `${fileName} has validation issues. ` : ""}
                Fix the rows below, then upload the CSV again.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-6 py-5">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" />
              {issues.length} validation issue{issues.length > 1 ? "s" : ""} found
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Template rule: `revisionDate` must be in US format `m/d/yyyy`.
            </div>
          </div>

          <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
            {issues.map((issue, index) => (
              <div key={`${issue.rowLabel}-${issue.field}-${index}`} className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                    <XCircle className="size-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">{issue.rowLabel}</span>
                      <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">{issue.field}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">{issue.message}</div>
                    {issue.suggestion ? <div className="text-xs leading-5 text-muted-foreground">Comment: {issue.suggestion}</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
