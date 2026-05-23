import * as React from "react";

import { authJsonHeaders, parseJsonResponse } from "@/core/app/lib/api";
import { toast } from "@/core/app/lib/toast";
import type { UtilityRecord } from "@/core/types/models/ems";
import { listUtilityRecords } from "@/features/operations/utilities/services/api";

export type DashboardWidgetData = {
  utilityOverview: {
    totalConsumption: number;
    recordCount: number;
    missingBillsCount: number;
    highVarianceCount: number;
    latestMonthLabel: string;
  };
  utilityTrend: Array<{ month: string; kwh: number }>;
  utilityApprovalQueue: {
    draft: number;
    pending: number;
    approved: number;
    audited: number;
  };
  companySnapshot: {
    total: number;
    active: number;
    names: string[];
  };
};

const EMPTY_WIDGET_DATA: DashboardWidgetData = {
  utilityOverview: {
    totalConsumption: 0,
    recordCount: 0,
    missingBillsCount: 0,
    highVarianceCount: 0,
    latestMonthLabel: "No month",
  },
  utilityTrend: [],
  utilityApprovalQueue: {
    draft: 0,
    pending: 0,
    approved: 0,
    audited: 0,
  },
  companySnapshot: {
    total: 0,
    active: 0,
    names: [],
  },
};

export function useDashboardWidgetData(userId: string) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<DashboardWidgetData>(EMPTY_WIDGET_DATA);

  React.useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoading(true);
        const [utilityRecords, companies] = await Promise.all([
          listUtilityRecords(userId),
          listDashboardCompanies(userId),
        ]);
        if (!active) return;
        setData(buildDashboardWidgetData(utilityRecords, companies));
      } catch (error) {
        if (!active) return;
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load dashboard widget data.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  return { loading, data };
}

function buildDashboardWidgetData(
  utilityRecords: UtilityRecord[],
  companies: CompanyOption[],
): DashboardWidgetData {
  const latestMonth = utilityRecords
    .map((item) => item.periodMonth || item.periodStart.slice(0, 7))
    .sort((left, right) => right.localeCompare(left))[0];

  const latestMonthRecords = latestMonth
    ? utilityRecords.filter(
        (item) =>
          (item.periodMonth || item.periodStart.slice(0, 7)) === latestMonth,
      )
    : [];

  const utilityTrend = Array.from(
    utilityRecords
      .filter((item) => item.type === "electricity")
      .reduce((map, item) => {
        const month = item.periodMonth || item.periodStart.slice(0, 7);
        map.set(month, (map.get(month) ?? 0) + Number(item.value || 0));
        return map;
      }, new Map<string, number>()),
    ([month, kwh]) => ({ month: formatMonth(month), kwh }),
  )
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6);

  const monthGroups = new Map<string, UtilityRecord[]>();
  for (const row of utilityRecords) {
    const month = row.periodMonth || row.periodStart.slice(0, 7);
    const meterKey = row.meterKey || row.meterName;
    const key = [row.facilityId, row.type, meterKey, month].join("|");
    const list = monthGroups.get(key) ?? [];
    list.push(row);
    monthGroups.set(key, list);
  }

  let draft = 0;
  let pending = 0;
  let approved = 0;
  let audited = 0;
  for (const rows of monthGroups.values()) {
    const approvalStatus = rows.some((row) => row.approvalStatus === "audited")
      ? "audited"
      : rows.some((row) => row.approvalStatus === "approved")
        ? "approved"
        : rows.find((row) => row.approvalStatus && row.approvalStatus !== "draft")
            ?.approvalStatus || "draft";

    if (approvalStatus === "audited") audited += 1;
    else if (approvalStatus === "approved") approved += 1;
    else if (approvalStatus === "draft") draft += 1;
    else pending += 1;
  }

  return {
    utilityOverview: {
      totalConsumption: latestMonthRecords.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0,
      ),
      recordCount: latestMonthRecords.length,
      missingBillsCount: latestMonthRecords.filter(
        (item) => !(item.billFiles?.length || 0),
      ).length,
      highVarianceCount: latestMonthRecords.filter(
        (item) => item.varianceFlag === "high",
      ).length,
      latestMonthLabel: latestMonth ? formatMonth(latestMonth) : "No month",
    },
    utilityTrend,
    utilityApprovalQueue: {
      draft,
      pending,
      approved,
      audited,
    },
    companySnapshot: {
      total: companies.length,
      active: companies.length,
      names: companies.slice(0, 5).map((item) => item.shortName || item.name),
    },
  };
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${shortMonths[Math.max(0, Number(month) - 1)] || "Mon"} ${String(year).slice(-2)}`;
}

type CompanyOption = {
  id: string;
  name: string;
  shortName?: string;
};

async function listDashboardCompanies(userId: string) {
  const response = await fetch("/api/system/companies/options", {
    cache: "no-store",
    headers: authJsonHeaders(userId),
  });
  return parseJsonResponse<CompanyOption[]>(
    response,
    "Could not load companies.",
  );
}
