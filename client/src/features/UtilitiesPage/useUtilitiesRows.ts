import type { CompanyOption } from "@/core/app/state/company";
import type { UtilityRecord, UtilityType } from "@/core/types/ems";

export function useUtilitiesRows({
  active,
  facilityId,
  search,
  extraRows = [],
  companies = [],
}: {
  active: UtilityType;
  facilityId?: string;
  search: string;
  extraRows?: UtilityRecord[];
  companies?: CompanyOption[];
}) {
  const companyNameById = new Map(companies.map((company) => [company.id, company.name.toLowerCase()]));
  const rows: UtilityRecord[] = [...extraRows]
    .filter((r) => r.type === active)
    .filter((r) => (facilityId ? r.facilityId === facilityId : true))
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.meterName.toLowerCase().includes(q) ||
        (companyNameById.get(r.facilityId) || "").includes(q)
      );
    });

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const highVarianceCount = rows.filter((r) => r.varianceFlag === "high").length;
  const missingBillsCount = rows.filter((r) => !(r.billFiles?.length)).length;
  const monthGroups = new Map<string, UtilityRecord[]>();
  for (const row of rows) {
    const key = row.periodMonth || row.periodStart.slice(0, 7);
    const list = monthGroups.get(key) ?? [];
    list.push(row);
    monthGroups.set(key, list);
  }
  const monthSummaries = Array.from(monthGroups.entries())
    .map(([month, monthRows]) => {
      const sample = monthRows[0];
      const missingDaysCount = Math.max(...monthRows.map((row) => Number(row.missingDaysCount || 0)));
      const approvalStatus = monthRows.some((row) => row.approvalStatus === "approved")
        ? "approved"
        : monthRows.some((row) => row.approvalStatus === "submitted")
          ? "submitted"
          : "pending";
      const monthComplete = monthRows.some((row) => row.monthComplete);
      const missingRanges = monthRows.find((row) => (row.missingRanges?.length || 0) > 0)?.missingRanges ?? [];
      return {
        month,
        facilityId: sample.facilityId,
        missingDaysCount,
        approvalStatus,
        monthComplete,
        missingRanges,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const readyToSubmitCount = monthSummaries.filter((item) => item.monthComplete && item.approvalStatus === "pending" && item.missingDaysCount === 0).length;
  const readyForApprovalCount = monthSummaries.filter((item) => item.approvalStatus === "submitted").length;

  const missingMonthLabels: string[] = [];
  for (let index = 1; index < monthSummaries.length; index += 1) {
    let cursor = nextMonth(monthSummaries[index - 1].month);
    while (cursor < monthSummaries[index].month) {
      missingMonthLabels.push(formatMonth(cursor));
      cursor = nextMonth(cursor);
    }
  }

  return { rows, total, highVarianceCount, missingBillsCount, readyToSubmitCount, readyForApprovalCount, monthSummaries, missingMonthLabels };
}

function nextMonth(month: string) {
  const [year, monthValue] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, (monthValue || 1) - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string) {
  const [year, monthValue] = month.split("-");
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${shortMonths[Math.max(0, Number(monthValue) - 1)] || "Mon"} ${String(year).slice(-2)}`;
}
