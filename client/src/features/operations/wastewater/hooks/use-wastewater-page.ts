import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

import { getWastewaterColumns } from "@/features/operations/wastewater/config/columns";
import {
  deleteWastewaterRecord,
  listWastewaterRecords,
  updateWastewaterRecord,
  uploadWastewaterLabReport,
  type WastewaterRecordInput,
} from "@/features/operations/wastewater/services/api";

type CompanyOption = {
  id: string;
  name: string;
};

type UseWastewaterPageArgs = {
  companies: CompanyOption[];
  selectedCompanyId?: string;
};

export function useWastewaterPage(props: UseWastewaterPageArgs) {
  const { userId } = useUser();
  const [rows, setRows] = React.useState<WastewaterRecord[]>([]);
  const [selected, setSelected] = React.useState<WastewaterRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await listWastewaterRecords(userId, {
        companyId: props.selectedCompanyId,
      });
      setRows(data);
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load wastewater records.");
      return [];
    }
  }, [props.selectedCompanyId, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!selected) {
      return;
    }
    const nextSelected = rows.find((row) => row.id === selected.id) || selected;
    setSelected(nextSelected);
  }, [rows, selected]);

  const getCompanyName = React.useCallback(
    (facilityId: string) => props.companies.find((company) => company.id === facilityId)?.name || "Company",
    [props.companies],
  );

  const latestOutlet = React.useMemo(() => rows.find((row) => row.point === "outlet") ?? rows[0], [rows]);
  const exceedances = React.useMemo(() => rows.filter((row) => row.exceedance?.length).length, [rows]);
  const trend = React.useMemo(
    () =>
      [...rows]
        .slice()
        .reverse()
        .map((row) => ({
          date: formatDate(row.sampleDate),
          pH: row.pH,
          COD: row.COD,
          BOD: row.BOD,
        })),
    [rows],
  );
  const columns = React.useMemo(() => getWastewaterColumns(getCompanyName), [getCompanyName]);

  const saveRecord = React.useCallback(
    async (recordId: string, input: WastewaterRecordInput, reportFile: File | null) => {
      setSaving(true);
      try {
        let updated = await updateWastewaterRecord(userId, recordId, input);
        if (reportFile) {
          updated = await uploadWastewaterLabReport(userId, {
            recordId,
            file: reportFile,
          });
        }
        setSelected(updated);
        await load();
        toast.success("Lab record updated");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Update failed.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [load, userId],
  );

  const removeRecord = React.useCallback(
    async (recordId: string) => {
      setDeleting(true);
      try {
        await deleteWastewaterRecord(userId, recordId);
        setSelected(null);
        setDetailOpen(false);
        await load();
        toast.success("Lab record deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Delete failed.");
      } finally {
        setDeleting(false);
      }
    },
    [load, userId],
  );

  return {
    rows,
    selected,
    setSelected,
    detailOpen,
    setDetailOpen,
    saving,
    deleting,
    getCompanyName,
    latestOutlet,
    exceedances,
    trend,
    columns,
    reload: load,
    saveRecord,
    removeRecord,
  };
}
