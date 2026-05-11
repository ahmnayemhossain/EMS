import * as React from "react";

import { Tabs, TabsContent } from "@/components/ui/primitives/tabs";
import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useCan } from "@/core/app/state/slices/permissions";
import { useUser } from "@/core/app/state/slices/user";
import { ActionModal } from "@/components/feedback/ActionModal";
import { PageHeader } from "@/components/layout/primitives/PageHeader";
import { CreateUtilityDialog } from "@/features/operations/utilities/components/CreateUtilityDialog";
import { EditUtilityDialog } from "@/features/operations/utilities/components/EditUtilityDialog";
import { UtilitiesFiltersBar } from "@/features/operations/utilities/components/UtilitiesFiltersBar";
import { UtilitiesKpis } from "@/features/operations/utilities/components/UtilitiesKpis";
import { UtilitiesTabStrip } from "@/features/operations/utilities/components/UtilitiesTabs";
import { utilityTypes } from "@/features/operations/utilities/config/constants";
import { getUtilityColumns } from "@/features/operations/utilities/config/columns";
import { UtilityAnalyticsSection } from "@/features/operations/utilities/page/UtilityAnalyticsSection";
import { UtilityDetailDrawer } from "@/features/operations/utilities/page/UtilityDetailDrawer";
import { UtilityRecordsSection } from "@/features/operations/utilities/page/UtilityRecordsSection";
import { createUtilityActions } from "@/features/operations/utilities/page/use-utility-actions";
import { useUtilitiesLoader } from "@/features/operations/utilities/page/use-utilities-loader";
import { useUtilitiesRows } from "@/features/operations/utilities/hooks/useUtilitiesRows";
import type { UtilityRecord, UtilityType } from "@/core/types/models/ems";

export function UtilitiesPage() {
  const isMobile = useIsMobile();
  const { selectedCompanyId, companies } = useSelectedCompany();
  const { userId } = useUser();
  const canSubmit = useCan("utilities:submit");
  const canApprove = useCan("utilities:approve");
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
  const { rows, total, highVarianceCount, missingBillsCount, readyToSubmitCount, readyForApprovalCount, monthSummaries, missingMonthLabels } = useUtilitiesRows({ active, facilityId, search, extraRows: utilityRows, companies });
  const trendData = React.useMemo(() => Array.from(rows.reduce((map, row) => map.set(row.periodStart.slice(0, 7), (map.get(row.periodStart.slice(0, 7)) ?? 0) + row.value), new Map<string, number>()), ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label)), [rows]);
  const monthWarnings = React.useMemo(() => monthSummaries.filter((item) => item.missingDaysCount > 0).map((item) => ({ month: formatMonth(item.month), detail: item.missingRanges.map((range) => range.start === range.end ? range.start : `${range.start} to ${range.end}`).join(", ") })), [monthSummaries]);
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
            onCreateUsage={async (payload) => { await actions.createUsage(payload); }}
          />
        }
      />
      <Tabs value={active} onValueChange={(value) => setActive(value as UtilityType)}>
        <UtilitiesTabStrip types={utilityTypes} />
        <TabsContent value={active} className="mt-4 space-y-4">
          <UtilitiesFiltersBar search={search} onSearchChange={setSearch} companyName={selectedCompany?.name || "No company selected"} onClear={() => { setSearch(""); setFacilityId(selectedCompanyId || undefined); }} />
          <UtilitiesKpis recordsCount={rows.length} total={total} highVarianceCount={highVarianceCount} missingBillsCount={missingBillsCount} readyToSubmitCount={readyToSubmitCount} readyForApprovalCount={readyForApprovalCount} />
          <UtilityAnalyticsSection isMobile={isMobile} trendData={trendData} missingMonthLabels={missingMonthLabels} monthWarnings={monthWarnings} />
          <UtilityRecordsSection isMobile={isMobile} rows={rows} loading={loading} columns={columns} getCompanyName={getCompanyName} onSelect={setSelected} />
        </TabsContent>
      </Tabs>
      <UtilityDetailDrawer selected={selected} companies={companies} getCompanyName={getCompanyName} canSubmit={canSubmit} canApprove={canApprove} onSelect={setSelected} onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} onApproveMonth={async () => { await actions.approveSelectedMonth(); }} onSubmitMonth={() => setSubmitOpen(true)} />
      <EditUtilityDialog open={editOpen} onOpenChange={setEditOpen} userId={userId} companies={companies} uomOptions={uomOptions} sourceOptions={sourceOptions} record={selected} existingRecords={utilityRows} onSave={async (payload) => { await actions.updateUsage(payload); }} />
      <ActionModal open={deleteOpen} onOpenChange={setDeleteOpen} tone="destructive" title="Delete this utility record?" description="This action removes the usage record from the server. This cannot be undone." confirmLabel="Delete" onConfirm={async () => { await actions.deleteSelected(); }} />
      <ActionModal open={submitOpen} onOpenChange={setSubmitOpen} tone="default" title="Submit full month for approval?" description="After submission, the configured approver email recipients will get an approval request. You can change data later, but it will reset the month back to pending." confirmLabel="Submit" onConfirm={async () => { await actions.submitSelectedMonth(); }} />
    </div>
  );
}

function formatMonth(month: string) {
  const [year, monthValue] = month.split("-");
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${shortMonths[Math.max(0, Number(monthValue) - 1)] || "Mon"} ${String(year).slice(-2)}`;
}

