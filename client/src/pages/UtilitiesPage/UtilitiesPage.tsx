import * as React from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { facilities } from "@/data/mock";
import { useSelectedFactory } from "@/app/state/factory";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { PageHeader } from "@/components/PageHeader";
import type { UtilityRecord, UtilityType } from "@/types/ems";

import { ActionModal } from "@/components/ActionModal";
import { CreateUtilityDialog } from "@/pages/UtilitiesPage/CreateUtilityDialog";
import {
  createUtilityRecord,
  deleteUtilityRecord,
  listUtilityRecords,
  updateUtilityRecord,
  type UtilityRecordInput,
} from "@/pages/UtilitiesPage/api";
import { EditUtilityDialog } from "@/pages/UtilitiesPage/EditUtilityDialog";
import type { UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import { getUtilityColumns } from "@/pages/UtilitiesPage/columns";
import { utilityTypes } from "@/pages/UtilitiesPage/constants";
import { UtilitiesComparisonCard } from "@/pages/UtilitiesPage/UtilitiesComparisonCard";
import { UtilitiesFiltersBar } from "@/pages/UtilitiesPage/UtilitiesFiltersBar";
import { UtilitiesKpis } from "@/pages/UtilitiesPage/UtilitiesKpis";
import { UtilitiesRecordsMobile } from "@/pages/UtilitiesPage/UtilitiesRecordsMobile";
import { UtilitiesTabStrip } from "@/pages/UtilitiesPage/UtilitiesTabs";
import { UtilitiesTrendCard } from "@/pages/UtilitiesPage/UtilitiesTrendCard";
import { UtilityRecordDetail } from "@/pages/UtilitiesPage/UtilityRecordDetail";
import { useUtilitiesRows } from "@/pages/UtilitiesPage/useUtilitiesRows";
import { formatDate, formatUtilityType } from "@/utils/format";
import { getFacilityName } from "@/data/mock";

export function UtilitiesPage() {
  const isMobile = useIsMobile();
  const { selectedFactoryId } = useSelectedFactory();

  const [active, setActive] = React.useState<UtilityType>("electricity");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<UtilityRecord | null>(null);
  const [utilityRows, setUtilityRows] = React.useState<UtilityRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { rows, total, highVarianceCount, missingBillsCount } = useUtilitiesRows({
    active,
    facilityId,
    search,
    extraRows: utilityRows,
  });

  const columns = React.useMemo(() => getUtilityColumns(), []);
  const trendData = React.useMemo(() => {
    const totalsByMonth = new Map<string, number>();

    for (const row of rows) {
      const label = row.periodStart.slice(0, 7);
      totalsByMonth.set(label, (totalsByMonth.get(label) ?? 0) + row.value);
    }

    return Array.from(totalsByMonth, ([label, value]) => ({ label, value })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [rows]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadUtilities() {
      setLoading(true);
      try {
        const records = await listUtilityRecords();
        if (!cancelled) setUtilityRows(records);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load utility records.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUtilities();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateUsage(payload: UtilityUsagePayload) {
    const record: UtilityRecordInput = {
      facilityId: payload.factoryId,
      type: payload.utilityType,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      meterName: payload.meterName,
      previousReading: payload.previousReading,
      currentReading: payload.currentReading,
      uom: payload.unit,
      value: payload.consumption,
      baselineValue: payload.baselineValue,
      minThreshold: payload.minThreshold,
      maxThreshold: payload.maxThreshold,
      variance: payload.variance,
      variancePercent: payload.variancePercent,
      varianceFlag:
        payload.status === "alert" || payload.status === "high"
          ? "high"
          : payload.status === "watch"
            ? "watch"
            : "normal",
      status: payload.status,
      remarks: payload.remarks,
      billFiles: payload.attachment
        ? [{ name: payload.attachment.name, uploadedAt: payload.attachment.uploadedAt }]
        : undefined,
    };

    try {
      const created = await createUtilityRecord(record);
      setUtilityRows((current) => [created, ...current]);
      toast.success("Utility usage saved");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save utility usage.");
      return false;
    }
  }

  async function handleUpdateUsage(payload: UtilityUsagePayload) {
    if (!selected) return false;

    const record: UtilityRecordInput = {
      facilityId: payload.factoryId,
      type: payload.utilityType,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      meterName: payload.meterName,
      previousReading: payload.previousReading,
      currentReading: payload.currentReading,
      uom: payload.unit,
      value: payload.consumption,
      varianceFlag:
        payload.status === "alert" || payload.status === "high"
          ? "high"
          : payload.status === "watch"
            ? "watch"
            : "normal",
      status: payload.status,
      remarks: payload.remarks,
      billFiles: payload.attachment
        ? [{ name: payload.attachment.name, uploadedAt: payload.attachment.uploadedAt }]
        : selected.billFiles,
    };

    try {
      const updated = await updateUtilityRecord(selected.id, record);
      setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setSelected(updated);
      toast.success("Utility usage updated");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update utility usage.");
      return false;
    }
  }

  async function handleDeleteSelected() {
    if (!selected) return;

    try {
      await deleteUtilityRecord(selected.id);
      setUtilityRows((current) => current.filter((row) => row.id !== selected.id));
      setSelected(null);
      setDeleteOpen(false);
      toast.success("Utility usage deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete utility usage.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <CreateUtilityDialog
            facilities={facilities}
            defaultFactoryId={selectedFactoryId}
            activeType={active}
            onCreateUsage={handleCreateUsage}
          />
        }
      />

      <Tabs value={active} onValueChange={(v) => setActive(v as UtilityType)}>
        <UtilitiesTabStrip types={utilityTypes} />

        <TabsContent value={active} className="mt-4 space-y-4">
          <UtilitiesFiltersBar
            search={search}
            onSearchChange={setSearch}
            facilityId={facilityId}
            onFacilityIdChange={setFacilityId}
            facilities={facilities}
            onClear={() => {
              setSearch("");
              setFacilityId(undefined);
            }}
          />

          <UtilitiesKpis
            recordsCount={rows.length}
            total={total}
            highVarianceCount={highVarianceCount}
            missingBillsCount={missingBillsCount}
          />

          {isMobile ? (
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex w-max gap-4 pb-1">
                <UtilitiesTrendCard data={trendData} className="w-[92vw] max-w-[720px] shrink-0" />
                <UtilitiesComparisonCard rows={rows} className="w-[92vw] max-w-[520px] shrink-0" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              <UtilitiesTrendCard data={trendData} />
              <UtilitiesComparisonCard rows={rows} />
            </div>
          )}

          {isMobile ? (
            <UtilitiesRecordsMobile rows={rows} onSelect={setSelected} />
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Utility records</div>
              {loading ? (
                <div className="text-muted-foreground rounded-xl border p-4 text-sm">
                  Loading utility records...
                </div>
              ) : (
              <DataTable rows={rows} columns={columns} rowKey={(r) => String(r.id)} onRowClick={setSelected} />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `${formatUtilityType(selected.type)} — ${selected.meterName}` : "Utility record"}
        description={
          selected
            ? `${selected.facilityId ? getFacilityName(selected.facilityId) : "Factory"} • ${formatDate(selected.periodStart)} to ${formatDate(selected.periodEnd)}`
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 size-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
            <UtilityRecordDetail record={selected} />
          </div>
        ) : null}
      </DetailPanel>

      <EditUtilityDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        facilities={facilities}
        record={selected}
        onSave={handleUpdateUsage}
      />

      <ActionModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tone="destructive"
        title="Delete this utility record?"
        description="This action removes the usage record from the server. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteSelected}
      />
    </div>
  );
}
