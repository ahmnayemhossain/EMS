import { Eye, FileSpreadsheet } from "lucide-react";

import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import type { ReportDefinition } from "@/features/assurance/reports/services/api";
import { getReportCategory, getReportScopeLabel, getReportVariableSummary } from "@/features/assurance/reports/utils/report-page-helpers";

export function ReportGridCard(input: {
  def: ReportDefinition;
  previewLoading: boolean;
  activeKey?: string;
  onPreview: (def: ReportDefinition) => void;
}) {
  const variableCount = (input.def.variables || []).filter((item) => item.name !== "companyId").length;
  const category = getReportCategory(input.def);
  const filterSummary = getReportVariableSummary(input.def);

  return (
    <Card className="h-full border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <span className="truncate">{input.def.name}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2">{input.def.description || "No description"}</CardDescription>
          </div>
          <Badge variant="outline">{getReportScopeLabel(input.def)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{category.label}</Badge>
          <Badge variant="secondary">
            {variableCount} filter{variableCount === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Filters</div>
          <div className="mt-1 text-sm text-foreground/90">{filterSummary}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
