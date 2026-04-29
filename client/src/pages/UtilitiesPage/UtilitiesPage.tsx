import * as React from "react";

import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useSelectedCompany } from "@/app/state/company";
import { useUser } from "@/app/state/user";
import { ActionModal } from "@/components/ActionModal";
import { PageHeader } from "@/components/PageHeader";
import { CreateUtilityDialog } from "@/pages/UtilitiesPage/CreateUtilityDialog";
import { EditUtilityDialog } from "@/pages/UtilitiesPage/EditUtilityDialog";
import { UtilitiesFiltersBar } from "@/pages/UtilitiesPage/UtilitiesFiltersBar";
import { UtilitiesKpis } from "@/pages/UtilitiesPage/UtilitiesKpis";
import { UtilitiesTabStrip } from "@/pages/UtilitiesPage/UtilitiesTabs";
import { utilityTypes } from "@/pages/UtilitiesPage/constants";
import { getUtilityColumns } from "@/pages/UtilitiesPage/columns";
import { UtilityAnalyticsSection } from "@/pages/UtilitiesPage/page/UtilityAnalyticsSection";
import { UtilityDetailDrawer } from "@/pages/UtilitiesPage/page/UtilityDetailDrawer";
import { UtilityRecordsSection } from "@/pages/UtilitiesPage/page/UtilityRecordsSection";
import { createUtilityActions } from "@/pages/UtilitiesPage/page/use-utility-actions";
import { useUtilitiesLoader } from "@/pages/UtilitiesPage/page/use-utilities-loader";
import { useUtilitiesRows } from "@/pages/UtilitiesPage/useUtilitiesRows";
import type { UtilityRecord, UtilityType } from "@/types/ems";

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
  const { utilityRows, setUtilityRows, uomOptions, sourceOptions, loading } = useUtilitiesLoader(userId);
  const { rows, total, highVarianceCount, missingBillsCount } = useUtilitiesRows({ active, facilityId, search, extraRows: utilityRows, companies });
  const trendData = React.useMemo(() => Array.from(rows.reduce((map, row) => map.set(row.periodStart.slice(0, 7), (map.get(row.periodStart.slice(0, 7)) ?? 0) + row.value), new Map<string, number>()), ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label)), [rows]);
  const columns = React.useMemo(() => getUtilityColumns(getCompanyName), [getCompanyName]);
  const actions = createUtilityActions({ userId, selected, setSelected, setDeleteOpen, setUtilityRows });

  React.useEffect(() => setFacilityId(selectedCompanyId || undefined), [selectedCompanyId]);

  return (
    <div className="space-y-6">
      <PageHeader actions={<CreateUtilityDialog companies={selectedCompany ? [selectedCompany] : companies} defaultCompanyId={selectedCompanyId} activeType={active} uomOptions={uomOptions} sourceOptions={sourceOptions} onCreateUsage={actions.createUsage} />} />
      <Tabs value={active} onValueChange={(value) => setActive(value as UtilityType)}>
        <UtilitiesTabStrip types={utilityTypes} />
        <TabsContent value={active} className="mt-4 space-y-4">
          <UtilitiesFiltersBar search={search} onSearchChange={setSearch} companyName={selectedCompany?.name || "No company selected"} onClear={() => { setSearch(""); setFacilityId(selectedCompanyId || undefined); }} />
          <UtilitiesKpis recordsCount={rows.length} total={total} highVarianceCount={highVarianceCount} missingBillsCount={missingBillsCount} />
          <UtilityAnalyticsSection isMobile={isMobile} rows={rows} trendData={trendData} getCompanyName={getCompanyName} />
          <UtilityRecordsSection isMobile={isMobile} rows={rows} loading={loading} columns={columns} getCompanyName={getCompanyName} onSelect={setSelected} />
        </TabsContent>
      </Tabs>
      <UtilityDetailDrawer selected={selected} companies={companies} getCompanyName={getCompanyName} onSelect={setSelected} onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
      <EditUtilityDialog open={editOpen} onOpenChange={setEditOpen} companies={companies} uomOptions={uomOptions} sourceOptions={sourceOptions} record={selected} onSave={actions.updateUsage} />
      <ActionModal open={deleteOpen} onOpenChange={setDeleteOpen} tone="destructive" title="Delete this utility record?" description="This action removes the usage record from the server. This cannot be undone." confirmLabel="Delete" onConfirm={actions.deleteSelected} />
    </div>
  );
}
