import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { formatDate, formatNumber } from "@/core/utils/format";
import type { TimelineItem } from "@/components/layout/primitives/TimelineList";
import type { WasteRecord } from "@/core/types/models/ems";

import { listWasteRecords } from "@/features/operations/waste/services/api";

type UseWastePageArgs = {
  companies: CompanyOption[];
  selectedCompanyId?: string;
};

export function useWastePage(props: UseWastePageArgs) {
  const { userId } = useUser();
  const [tab, setTab] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>(props.selectedCompanyId);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [allRows, setAllRows] = React.useState<WasteRecord[]>([]);

  React.useEffect(() => {
    setCompanyId(props.selectedCompanyId);
  }, [props.selectedCompanyId]);

  const load = React.useCallback(async () => {
    try {
      const rows = await listWasteRecords(userId);
      setAllRows(rows);
      return rows;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load waste logs.");
      return [];
    }
  }, [userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const getCompanyName = React.useCallback(
    (facilityId: string) => props.companies.find((company) => company.id === facilityId)?.name || "Company",
    [props.companies],
  );

  const rows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : undefined;
    const toTs = dateTo ? new Date(dateTo).getTime() : undefined;

    return allRows
      .filter((row) => (companyId ? row.facilityId === companyId : true))
      .filter((row) => matchesWasteTab(row, tab))
      .filter((row) => {
        if (!query) {
          return true;
        }
        return (
          row.stream.toLowerCase().includes(query) ||
          row.storageLocation.toLowerCase().includes(query) ||
          (row.vendor ?? "").toLowerCase().includes(query) ||
          getCompanyName(row.facilityId).toLowerCase().includes(query)
        );
      })
      .filter((row) => {
        if (!fromTs && !toTs) {
          return true;
        }
        const rowTs = new Date(row.date).getTime();
        if (fromTs && rowTs < fromTs) {
          return false;
        }
        if (toTs && rowTs > toTs) {
          return false;
        }
        return true;
      });
  }, [allRows, companyId, dateFrom, dateTo, getCompanyName, search, tab]);

  const disposalTimeline: TimelineItem[] = React.useMemo(
    () =>
      rows
        .filter((row) => row.disposalStatus !== "disposed")
        .map((row) => ({
          id: row.id,
          title: `${row.stream} - ${formatNumber(row.qtyKg)} kg`,
          date: row.dueBy ? `Due ${formatDate(row.dueBy)}` : `Logged ${formatDate(row.date)}`,
          description: `${getCompanyName(row.facilityId)} - ${row.vendor ?? "Vendor not assigned"}`,
          tone: row.type === "hazardous" ? "warning" : "info",
        })),
    [getCompanyName, rows],
  );

  const clearFilters = React.useCallback(() => {
    setSearch("");
    setCompanyId(props.selectedCompanyId);
    setDateFrom("");
    setDateTo("");
  }, [props.selectedCompanyId]);

  return {
    tab,
    setTab,
    search,
    setSearch,
    companyId,
    setCompanyId,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    rows,
    companies: props.companies,
    getCompanyName,
    reload: load,
    clearFilters,
    hazardousBacklog: rows.filter((row) => row.type === "hazardous" && row.disposalStatus !== "disposed").length,
    dueSoon: rows.filter((row) => row.dueBy && new Date(row.dueBy).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000).length,
    totalKgLabel: `${formatNumber(rows.reduce((sum, row) => sum + row.qtyKg, 0))} kg`,
    disposalTimeline,
  };
}

function matchesWasteTab(row: WasteRecord, tab: string) {
  switch (tab) {
    case "stored":
      return row.disposalStatus === "stored";
    case "scheduled":
      return row.disposalStatus === "scheduled";
    case "disposed":
      return row.disposalStatus === "disposed";
    case "sludge":
      return row.type === "sludge";
    case "hazardous":
      return row.type === "hazardous";
    default:
      return true;
  }
}
