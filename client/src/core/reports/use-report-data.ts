import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { listUtilityRecords } from "@/features/UtilitiesPage/api";
import { utilityTypes } from "@/features/UtilitiesPage/constants";
import type { ReportData } from "@/core/reports/report-types";
import type { UtilityRecord } from "@/core/types/ems";
import type { UtilityType } from "@/core/types/ems";
import { formatUtilityType } from "@/core/utils/format";

export function useReportData(input: {
  userId: string;
  companyId: string;
  search: string;
  typeFilter: string;
}): ReportData {
  const [rows, setRows] = React.useState<UtilityRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const records = await listUtilityRecords(input.userId);
        if (!cancelled) setRows(records);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Failed to load report data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [input.userId]);

  const filteredRows = React.useMemo(() => filterRows(rows, input), [input, rows]);
  return {
    loading,
    filteredRows,
    recentRows: getRecentRows(filteredRows),
    monthlyRows: getMonthlyRows(filteredRows),
    summary: getSummary(filteredRows),
  };
}

function filterRows(rows: UtilityRecord[], input: { companyId: string; search: string; typeFilter: string }) {
  const query = input.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (input.companyId && row.facilityId !== input.companyId) return false;
    if (input.typeFilter !== "all" && row.type !== input.typeFilter) return false;
    if (!query) return true;
    return [row.meterName, row.sourceName, row.uom, row.remarks, formatUtilityType(row.type)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function getSummary(rows: UtilityRecord[]) {
  const totalsByType = new Map<UtilityType, number>(utilityTypes.map((type) => [type, 0]));
  for (const row of rows) totalsByType.set(row.type, (totalsByType.get(row.type) ?? 0) + row.value);
  const flaggedRecords = rows.filter((row) => row.varianceFlag === "high" || row.status === "alert").length;
  const withBills = rows.filter((row) => (row.billFiles?.length ?? 0) > 0).length;
  const topType = utilityTypes.map((type) => ({ type, total: totalsByType.get(type) ?? 0 })).sort((a, b) => b.total - a.total)[0] ?? null;
  return { totalRecords: rows.length, flaggedRecords, attachmentCoverage: rows.length ? Math.round((withBills / rows.length) * 100) : 0, topType };
}

function getRecentRows(rows: UtilityRecord[]) {
  return [...rows].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd)).slice(0, 8);
}

function getMonthlyRows(rows: UtilityRecord[]) {
  const grouped = new Map<string, { count: number; total: number }>();
  for (const row of rows) {
    const month = row.periodStart.slice(0, 7);
    const current = grouped.get(month) ?? { count: 0, total: 0 };
    grouped.set(month, { count: current.count + 1, total: current.total + row.value });
  }
  return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
}
