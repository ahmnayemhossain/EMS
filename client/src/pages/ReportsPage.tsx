import * as React from "react";
import { Download, FileSpreadsheet, LineChart, TriangleAlert } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useSelectedCompany } from "@/app/state/company";
import { useUser } from "@/app/state/user";
import { FilterBar } from "@/components/FilterBar";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { listUtilityRecords } from "@/pages/UtilitiesPage/api";
import { utilityTypes } from "@/pages/UtilitiesPage/constants";
import type { UtilityRecord, UtilityType } from "@/types/ems";
import { formatDate, formatNumber, formatUtilityType } from "@/utils/format";

function downloadTextFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const { userId } = useUser();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [rows, setRows] = React.useState<UtilityRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadReportsData() {
      setLoading(true);
      try {
        const records = await listUtilityRecords(userId);
        if (!cancelled) setRows(records);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load report data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadReportsData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const selectedCompany = React.useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId],
  );

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (selectedCompanyId && row.facilityId !== selectedCompanyId) return false;
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (!query) return true;

      return [
        row.meterName,
        row.sourceName,
        row.uom,
        row.remarks,
        formatUtilityType(row.type),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [rows, search, selectedCompanyId, typeFilter]);

  const summary = React.useMemo(() => {
    const flagged = filteredRows.filter((row) => row.varianceFlag === "high" || row.status === "alert").length;
    const withBills = filteredRows.filter((row) => (row.billFiles?.length ?? 0) > 0).length;
    const totalsByType = new Map<UtilityType, number>();

    for (const type of utilityTypes) totalsByType.set(type, 0);
    for (const row of filteredRows) totalsByType.set(row.type, (totalsByType.get(row.type) ?? 0) + row.value);

    return {
      totalRecords: filteredRows.length,
      flaggedRecords: flagged,
      attachmentCoverage: filteredRows.length ? Math.round((withBills / filteredRows.length) * 100) : 0,
      topType:
        utilityTypes
          .map((type) => ({ type, total: totalsByType.get(type) ?? 0 }))
          .sort((a, b) => b.total - a.total)[0] ?? null,
    };
  }, [filteredRows]);

  const recentRows = React.useMemo(
    () =>
      [...filteredRows]
        .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))
        .slice(0, 8),
    [filteredRows],
  );

  const monthlyRows = React.useMemo(() => {
    const grouped = new Map<string, { count: number; total: number }>();

    for (const row of filteredRows) {
      const month = row.periodStart.slice(0, 7);
      const current = grouped.get(month) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += row.value;
      grouped.set(month, current);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6);
  }, [filteredRows]);

  function handleExportCsv() {
    if (!filteredRows.length) {
      toast.error("No report data available for export.");
      return;
    }

    const lines = [
      ["Company", "Utility Type", "Meter Name", "Source", "Period Start", "Period End", "Consumption", "UOM", "Status"]
        .join(","),
      ...filteredRows.map((row) =>
        [
          selectedCompany?.name ?? row.facilityId,
          formatUtilityType(row.type),
          row.meterName,
          row.sourceName ?? "",
          row.periodStart,
          row.periodEnd,
          row.value,
          row.uom,
          row.status ?? "normal",
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];

    downloadTextFile(lines.join("\n"), "utilities-report.csv", "text/csv;charset=utf-8");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        actions={
          <Button onClick={handleExportCsv} disabled={!filteredRows.length}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search meter, source, remarks…" />
            </div>
            <SelectFilter
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Utility type"
              items={[
                { value: "all", label: "All utility types" },
                ...utilityTypes.map((type) => ({ value: type, label: formatUtilityType(type) })),
              ]}
              className="sm:w-[220px]"
            />
          </div>
        }
        right={
          <div className="text-muted-foreground text-sm">
            {selectedCompany?.name ?? "No company selected"}
          </div>
        }
        onClear={() => {
          setSearch("");
          setTypeFilter("all");
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium">Utility records</CardTitle>
              <FileSpreadsheet className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "--" : summary.totalRecords}</div>
            <div className="text-muted-foreground mt-1 text-xs">Records in current report scope</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium">Flagged records</CardTitle>
              <TriangleAlert className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "--" : summary.flaggedRecords}</div>
            <div className="text-muted-foreground mt-1 text-xs">High variance or alert status</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium">Attachment coverage</CardTitle>
              <Download className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "--" : `${summary.attachmentCoverage}%`}</div>
            <div className="text-muted-foreground mt-1 text-xs">Records with bill or supporting file</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium">Top utility type</CardTitle>
              <LineChart className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {loading || !summary.topType ? "--" : formatUtilityType(summary.topType.type)}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {loading || !summary.topType ? "Waiting for data" : `${formatNumber(summary.topType.total)} total usage`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Recent utility records</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentRows.length ? (
                recentRows.map((row) => (
                  <div key={row.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1.2fr,auto,auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{row.meterName}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {formatUtilityType(row.type)}
                        {row.sourceName ? ` - ${row.sourceName}` : ""}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatNumber(row.value)} {row.uom}
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <StatusBadge tone={row.status === "alert" ? "critical" : row.status === "high" ? "warning" : "info"}>
                        {row.status ?? "normal"}
                      </StatusBadge>
                      <span className="text-muted-foreground text-xs">{formatDate(row.periodEnd)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                  No utility records found for the current filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Monthly snapshot</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {monthlyRows.length ? (
                monthlyRows.map(([month, info]) => (
                  <div key={month} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{month}</div>
                      <StatusBadge tone="info">{info.count} records</StatusBadge>
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">{formatNumber(info.total)} total consumption</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                  Monthly report data will appear after utility records are added.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
