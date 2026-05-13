import { Eye, FileSpreadsheet } from "lucide-react";

import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import type { ReportDefinition } from "@/features/assurance/reports/services/api";

export function ReportGridCard(input: {
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
