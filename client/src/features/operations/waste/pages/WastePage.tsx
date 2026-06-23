import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import type { WasteRecord } from "@/core/types/models/ems";

import { WasteCreateDialog } from "../components/WasteCreateDialog";
import { WasteDetailPanel } from "../components/WasteDetailPanel";
import { WasteKpis } from "../components/WasteKpis";
import { wasteTabs } from "../config/constants";
import { WasteFilters } from "../page/WasteFilters";
import { WastePanels } from "../page/WastePanels";
import { useWastePage } from "../page/use-waste-page";
import { deleteWasteRecord, updateWasteRecord, uploadWasteAttachment, type WasteRecordInput } from "../services/api";

export function WastePage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const page = useWastePage({ companies, selectedCompanyId: selectedCompanyId || undefined });
  const [selected, setSelected] = React.useState<WasteRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!selected) return;
    const nextSelected = page.rows.find((row) => row.id === selected.id) || selected;
    setSelected(nextSelected);
  }, [page.rows, selected]);

  const handleSave = React.useCallback(
    async (recordId: string, input: WasteRecordInput, attachmentFile: File | null) => {
      setSaving(true);
      try {
        let updated = await updateWasteRecord(userId, recordId, input);
        if (attachmentFile) {
          updated = await uploadWasteAttachment(userId, {
            recordId,
            file: attachmentFile,
          });
        }
        setSelected(updated);
        await page.reload();
        toast.success("Waste record updated");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Update failed.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [page, userId],
  );

  const handleDelete = React.useCallback(
    async (recordId: string) => {
      setDeleting(true);
      try {
        await deleteWasteRecord(userId, recordId);
        setSelected(null);
        setDetailOpen(false);
        await page.reload();
        toast.success("Waste record deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Delete failed.");
      } finally {
        setDeleting(false);
      }
    },
    [page, userId],
  );

  return (
    <div className="space-y-6">
      <WasteCreateDialog companies={companies} initialCompanyId={page.companyId} onCreated={page.reload} floating />

      <WasteKpis
        rowsCount={page.rows.length}
        totalKgLabel={page.totalKgLabel}
        hazardousBacklog={page.hazardousBacklog}
        dueSoon={page.dueSoon}
      />

      <Tabs value={page.tab} onValueChange={page.setTab}>
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1 sm:grid-cols-6">
          {wasteTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm">
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={page.tab} className="mt-4 space-y-4">
          <WasteFilters
            search={page.search}
            setSearch={page.setSearch}
            companyId={page.companyId}
            setCompanyId={page.setCompanyId}
            companies={page.companies}
            dateFrom={page.dateFrom}
            setDateFrom={page.setDateFrom}
            dateTo={page.dateTo}
            setDateTo={page.setDateTo}
            clear={() => {
              page.setSearch("");
              page.setCompanyId(selectedCompanyId || undefined);
              page.setDateFrom("");
              page.setDateTo("");
            }}
          />

          <WastePanels
            rows={page.rows}
            disposalTimeline={page.disposalTimeline}
            getCompanyName={page.getCompanyName}
            onSelect={(row) => {
              setSelected(row);
              setDetailOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <WasteDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        record={selected}
        companies={companies}
        getCompanyName={page.getCompanyName}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
        deleting={deleting}
      />
    </div>
  );
}
