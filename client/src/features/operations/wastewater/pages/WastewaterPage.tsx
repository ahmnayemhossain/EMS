import * as React from "react";

import { ResponsiveWidgetGroup } from "@/components/layout/primitives/ResponsiveWidgetGroup";
import { DataTable } from "@/components/table/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

import { WastewaterCreateDialog } from "../components/WastewaterCreateDialog";
import { WastewaterDetailPanel } from "../components/WastewaterDetailPanel";
import { WastewaterKpis } from "../components/WastewaterKpis";
import { WastewaterThresholdsCard } from "../components/WastewaterThresholdsCard";
import { WastewaterTrendCard } from "../components/WastewaterTrendCard";
import { getWastewaterColumns } from "../config/columns";
import { wastewaterThresholds } from "../config/constants";
import {
  deleteWastewaterRecord,
  listWastewaterRecords,
  updateWastewaterRecord,
  uploadWastewaterLabReport,
  type WastewaterRecordInput,
} from "../services/api";

export function WastewaterPage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const [rows, setRows] = React.useState<WastewaterRecord[]>([]);
  const [selected, setSelected] = React.useState<WastewaterRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await listWastewaterRecords(userId, {
        companyId: selectedCompanyId || undefined,
      });
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load wastewater records.");
    }
  }, [selectedCompanyId, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!selected) return;
    const nextSelected = rows.find((row) => row.id === selected.id) || selected;
    setSelected(nextSelected);
  }, [rows, selected]);

  const getCompanyName = React.useCallback(
    (facilityId: string) => companies.find((company) => company.id === facilityId)?.name || "Company",
    [companies],
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

  const handleSave = React.useCallback(
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

  const handleDelete = React.useCallback(
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

  return (
    <div className="space-y-6">
      <WastewaterCreateDialog companies={companies} initialCompanyId={selectedCompanyId || undefined} onCreated={load} floating />

      <WastewaterKpis
        totalSamples={rows.length}
        outletSamples={rows.filter((row) => row.point === "outlet").length}
        latestPh={latestOutlet ? latestOutlet.pH : "-"}
        latestCod={latestOutlet ? `${latestOutlet.COD} mg/L` : "-"}
        latestBod={latestOutlet ? `${latestOutlet.BOD} mg/L` : "-"}
        exceedanceCount={exceedances}
      />

      <ResponsiveWidgetGroup
        desktopClassName="grid gap-4 xl:grid-cols-3"
        mobileItemClassName="w-[min(92vw,560px)]"
        items={[
          {
            key: "trend",
            node: (
              <div className="xl:col-span-2">
                <WastewaterTrendCard data={trend} />
              </div>
            ),
          },
          {
            key: "latest",
            node: (
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle>Latest sample</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {latestOutlet ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium capitalize">{latestOutlet.point}</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <DetailItem label="Date" value={formatDate(latestOutlet.sampleDate)} />
                        <DetailItem label="Company" value={getCompanyName(latestOutlet.facilityId)} />
                        <DetailItem label="pH" value={String(latestOutlet.pH)} />
                        <DetailItem label="COD" value={`${latestOutlet.COD} mg/L`} />
                        <DetailItem label="BOD" value={`${latestOutlet.BOD} mg/L`} />
                        <DetailItem label="TSS" value={`${latestOutlet.TSS} mg/L`} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No lab sample added yet.</div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            key: "thresholds",
            node: <WastewaterThresholdsCard thresholds={wastewaterThresholds} />,
          },
        ]}
      />

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Lab reports</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            onRowClick={(row) => {
              setSelected(row);
              setDetailOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <WastewaterDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        record={selected}
        companies={companies}
        getCompanyName={getCompanyName}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
        deleting={deleting}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
