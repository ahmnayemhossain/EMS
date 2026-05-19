import type { CompanyOption } from "@/core/app/state/slices/company";
import type { UtilityRecord, UtilityType } from "@/core/types/models/ems";

function getTrackerKey(row: UtilityRecord) {
  return [row.facilityId, row.type, row.meterKey || row.meterName].join("|");
}

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
  const companyNameById = new Map(
    companies.map((company) => [company.id, company.name.toLowerCase()]),
  );

  const rows: UtilityRecord[] = [...extraRows]
    .filter((record) => record.type === active)
    .filter((record) => (facilityId ? record.facilityId === facilityId : true))
    .filter((record) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        record.meterName.toLowerCase().includes(query) ||
        (companyNameById.get(record.facilityId) || "").includes(query)
      );
    });

  const total = rows.reduce((sum, record) => sum + record.value, 0);
  const highVarianceCount = rows.filter((record) => record.varianceFlag === "high").length;
  const missingBillsCount = rows.filter((record) => !(record.billFiles?.length)).length;

  const trackerMonthGroups = new Map<string, UtilityRecord[]>();
  for (const row of rows) {
    const month = row.periodMonth || row.periodStart.slice(0, 7);
    const key = `${getTrackerKey(row)}|${month}`;
    const list = trackerMonthGroups.get(key) ?? [];
    list.push(row);
    trackerMonthGroups.set(key, list);
  }

  const monthSummaries = Array.from(trackerMonthGroups.entries())
    .map(([key, monthRows]) => {
      const sample = monthRows[0];
      const month = sample.periodMonth || sample.periodStart.slice(0, 7);
      const missingDaysCount = Math.max(
        ...monthRows.map((row) => Number(row.missingDaysCount || 0)),
      );
      const approvalStatus = monthRows.some((row) => row.approvalStatus === "approved")
        ? "approved"
        : monthRows.some((row) => row.approvalStatus === "submitted")
          ? "submitted"
          : "pending";
      const monthComplete = monthRows.some((row) => row.monthComplete);
      const missingRanges =
        monthRows.find((row) => (row.missingRanges?.length || 0) > 0)?.missingRanges ?? [];

      return {
        key,
        month,
        facilityId: sample.facilityId,
        meterKey: sample.meterKey || sample.meterName,
        missingDaysCount,
        approvalStatus,
        monthComplete,
        missingRanges,
      };
    })
    .sort((left, right) => left.month.localeCompare(right.month));

  const readyToSubmitCount = monthSummaries.filter(
    (item) =>
      item.monthComplete &&
      item.approvalStatus === "pending" &&
      item.missingDaysCount === 0,
  ).length;
  const readyForApprovalCount = monthSummaries.filter(
    (item) => item.approvalStatus === "submitted",
  ).length;

  const trackerMonths = new Map<string, string[]>();
  for (const row of rows) {
    const key = getTrackerKey(row);
    const month = row.periodMonth || row.periodStart.slice(0, 7);
    const list = trackerMonths.get(key) ?? [];
    if (!list.includes(month)) list.push(month);
    trackerMonths.set(key, list);
  }

  const missingMonthSet = new Set<string>();
  for (const months of trackerMonths.values()) {
    const sortedMonths = [...months].sort((a, b) => a.localeCompare(b));
    for (let index = 1; index < sortedMonths.length; index += 1) {
      let cursor = nextMonth(sortedMonths[index - 1]);
      while (cursor < sortedMonths[index]) {
        missingMonthSet.add(formatMonth(cursor));
        cursor = nextMonth(cursor);
      }
    }
  }

  return {
    rows,
    total,
    highVarianceCount,
    missingBillsCount,
    readyToSubmitCount,
    readyForApprovalCount,
    monthSummaries,
    missingMonthLabels: Array.from(missingMonthSet),
  };
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
