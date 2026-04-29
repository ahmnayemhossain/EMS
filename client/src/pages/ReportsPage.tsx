import * as React from "react";
import { Download } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { useSelectedCompany } from "@/app/state/company";
import { useUser } from "@/app/state/user";
import { PageHeader } from "@/components/PageHeader";
import { downloadTextFile } from "@/pages/reports/download-text-file";
import { MonthlySnapshotCard } from "@/pages/reports/MonthlySnapshotCard";
import { RecentRecordsCard } from "@/pages/reports/RecentRecordsCard";
import { ReportFilters } from "@/pages/reports/ReportFilters";
import { ReportSummaryGrid } from "@/pages/reports/ReportSummaryGrid";
import { useReportData } from "@/pages/reports/use-report-data";
import { formatUtilityType } from "@/utils/format";

export function ReportsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const { userId } = useUser();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const selectedCompany = React.useMemo(() => companies.find((company) => company.id === selectedCompanyId), [companies, selectedCompanyId]);
  const report = useReportData({ userId, companyId: selectedCompanyId, search, typeFilter });

  function handleExportCsv() {
    if (!report.filteredRows.length) return;
    const header = ["Company", "Utility Type", "Meter Name", "Source", "Period Start", "Period End", "Consumption", "UOM", "Status"].join(",");
    const body = report.filteredRows.map((row) => [selectedCompany?.name ?? row.facilityId, formatUtilityType(row.type), row.meterName, row.sourceName ?? "", row.periodStart, row.periodEnd, row.value, row.uom, row.status ?? "normal"].map(escapeCsv).join(","));
    downloadTextFile([header, ...body].join("\n"), "utilities-report.csv", "text/csv;charset=utf-8");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" actions={<Button onClick={handleExportCsv} disabled={!report.filteredRows.length}><Download className="mr-2 size-4" />Export CSV</Button>} />
      <ReportFilters
        search={search}
        typeFilter={typeFilter}
        companyName={selectedCompany?.name ?? "No company selected"}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
        onClear={() => { setSearch(""); setTypeFilter("all"); }}
      />
      <ReportSummaryGrid loading={report.loading} summary={report.summary} />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2"><RecentRecordsCard rows={report.recentRows} /></div>
        <MonthlySnapshotCard rows={report.monthlyRows} />
      </div>
    </div>
  );
}

function escapeCsv(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
