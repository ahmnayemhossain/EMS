import * as React from "react";

import { Tabs, TabsContent } from "@/core/app/components/ui/tabs";
import { useIsMobile } from "@/core/app/components/ui/use-mobile";
import { useSelectedCompany } from "@/core/app/state/company";
import { useUser } from "@/core/app/state/user";
import { ActionModal } from "@/core/components/ActionModal";
import { PageHeader } from "@/core/components/PageHeader";
import { CreateUtilityDialog } from "@/features/UtilitiesPage/CreateUtilityDialog";
import { EditUtilityDialog } from "@/features/UtilitiesPage/EditUtilityDialog";
import { UtilitiesFiltersBar } from "@/features/UtilitiesPage/UtilitiesFiltersBar";
import { UtilitiesKpis } from "@/features/UtilitiesPage/UtilitiesKpis";
import { UtilitiesTabStrip } from "@/features/UtilitiesPage/UtilitiesTabs";
import { utilityTypes } from "@/features/UtilitiesPage/constants";
import { getUtilityColumns } from "@/features/UtilitiesPage/columns";
import { UtilityAnalyticsSection } from "@/features/UtilitiesPage/page/UtilityAnalyticsSection";
import { UtilityDetailDrawer } from "@/features/UtilitiesPage/page/UtilityDetailDrawer";
import { UtilityRecordsSection } from "@/features/UtilitiesPage/page/UtilityRecordsSection";
import { createUtilityActions } from "@/features/UtilitiesPage/page/use-utility-actions";
import { useUtilitiesLoader } from "@/features/UtilitiesPage/page/use-utilities-loader";
import { useUtilitiesRows } from "@/features/UtilitiesPage/useUtilitiesRows";
import type { UtilityRecord, UtilityType } from "@/core/types/ems";

export function UtilitiesPage() {
  const isMobile = useIsMobile();
  const { selectedCompanyId, companies } = useSelectedCompany();
  const { userId } = useUser();
  const selectedCompany = React.useMemo(() => companies.find((company) => company.id === selectedCompanyId), [companies, selectedCompanyId]);
  const getCompanyName = React.useCallback((id: string) => companies.find((company) => company.id === id)?.name || "Company", [companies]);
  const [active, setActive] = React.useState<UtilityType>("electricity");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>(selectedCompanyId || undefined);
  const [selected, setSelected] = React.useState<UtilityRecord | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [submitOpen, setSubmitOpen] = React.useState(false);
  const { utilityRows, setUtilityRows, uomOptions, sourceOptions, loading, reloadUtilities } = useUtilitiesLoader(userId, { facilityId });
  const { rows, total, highVarianceCount, missingBillsCount } = useUtilitiesRows({ active, facilityId, search, extraRows: utilityRows, companies });
  const trendData = React.useMemo(() => Array.from(rows.reduce((map, row) => map.set(row.periodStart.slice(0, 7), (map.get(row.periodStart.slice(0, 7)) ?? 0) + row.value), new Map<string, number>()), ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label)), [rows]);
  const columns = React.useMemo(() => getUtilityColumns(getCompanyName), [getCompanyName]);
  const actions = createUtilityActions({ userId, selected, setSelected, setDeleteOpen, setUtilityRows, reloadUtilities });

  React.useEffect(() => setFacilityId(selectedCompanyId || undefined), [selectedCompanyId]);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <CreateUtilityDialog
            userId={userId}
            companies={selectedCompany ? [selectedCompany] : companies}
            defaultCompanyId={selectedCompanyId}
            activeType={active}
            uomOptions={uomOptions}
            sourceOptions={sourceOptions}
            existingRecords={utilityRows}
            onCreateUsage={actions.createUsage}
          />
        }
      />
      <Tabs value={active} onValueChange={(value) => setActive(value as UtilityType)}>
        <UtilitiesTabStrip types={utilityTypes} />
        <TabsContent value={active} className="mt-4 space-y-4">
          <UtilitiesFiltersBar search={search} onSearchChange={setSearch} companyName={selectedCompany?.name || "No company selected"} onClear={() => { setSearch(""); setFacilityId(selectedCompanyId || undefined); }} />
          <UtilitiesKpis recordsCount={rows.length} total={total} highVarianceCount={highVarianceCount} missingBillsCount={missingBillsCount} />
          <UtilityAnalyticsSection isMobile={isMobile} rows={rows} trendData={trendData} getCompanyName={getCompanyName} />
          <UtilityRecordsSection isMobile={isMobile} rows={rows} loading={loading} columns={columns} getCompanyName={getCompanyName} onSelect={setSelected} />
        </TabsContent>
      </Tabs>
      <UtilityDetailDrawer selected={selected} companies={companies} getCompanyName={getCompanyName} onSelect={setSelected} onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} onApproveMonth={actions.approveSelectedMonth} onSubmitMonth={() => setSubmitOpen(true)} />
      <EditUtilityDialog open={editOpen} onOpenChange={setEditOpen} userId={userId} companies={companies} uomOptions={uomOptions} sourceOptions={sourceOptions} record={selected} existingRecords={utilityRows} onSave={actions.updateUsage} />
      <ActionModal open={deleteOpen} onOpenChange={setDeleteOpen} tone="destructive" title="Delete this utility record?" description="This action removes the usage record from the server. This cannot be undone." confirmLabel="Delete" onConfirm={actions.deleteSelected} />
      <ActionModal open={submitOpen} onOpenChange={setSubmitOpen} tone="default" title="Submit full month for approval?" description="After submission, the configured approver email recipients will get an approval request. You can change data later, but it will reset the month back to pending." confirmLabel="Submit" onConfirm={async () => { const ok = await actions.submitSelectedMonth(); if (ok !== false) setSubmitOpen(false); }} />
    </div>
  );
}
