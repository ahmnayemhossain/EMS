import { Download, FileSpreadsheet, LineChart, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PageKpiGrid } from "@/components/PageKpiGrid";
import type { ReportSummary } from "@/pages/reports/report-types";
import { formatNumber, formatUtilityType } from "@/utils/format";

export function ReportSummaryGrid(props: { loading: boolean; summary: ReportSummary }) {
  return (
    <PageKpiGrid columnsClassName="sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard title="Utility records" icon={FileSpreadsheet} value={props.loading ? "--" : props.summary.totalRecords} helper="Records in current report scope" />
      <SummaryCard title="Flagged records" icon={TriangleAlert} value={props.loading ? "--" : props.summary.flaggedRecords} helper="High variance or alert status" />
      <SummaryCard title="Attachment coverage" icon={Download} value={props.loading ? "--" : `${props.summary.attachmentCoverage}%`} helper="Records with bill or supporting file" />
      <SummaryCard
        title="Top utility type"
        icon={LineChart}
        value={props.loading || !props.summary.topType ? "--" : formatUtilityType(props.summary.topType.type)}
        helper={props.loading || !props.summary.topType ? "Waiting for data" : `${formatNumber(props.summary.topType.total)} total usage`}
      />
    </PageKpiGrid>
  );
}

function SummaryCard(props: { title: string; icon: React.ComponentType<{ className?: string }>; value: React.ReactNode; helper: string }) {
  const Icon = props.icon;
  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
          <Icon className="text-muted-foreground size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{props.value}</div>
        <div className="text-muted-foreground mt-1 text-xs">{props.helper}</div>
      </CardContent>
    </Card>
  );
}
