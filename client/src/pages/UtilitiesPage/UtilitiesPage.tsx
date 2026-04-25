import * as React from "react";

import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { facilities } from "@/data/mock";
import { useSelectedFactory } from "@/app/state/factory";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { PageHeader } from "@/components/PageHeader";
import type { UtilityRecord, UtilityType } from "@/types/ems";

import { CreateUtilityDialog } from "@/pages/UtilitiesPage/CreateUtilityDialog";
import { getUtilityColumns } from "@/pages/UtilitiesPage/columns";
import { utilityTypes, trendMock } from "@/pages/UtilitiesPage/constants";
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

  const { rows, total, highVarianceCount, missingBillsCount } = useUtilitiesRows({
    active,
    facilityId,
    search,
  });

  const columns = React.useMemo(() => getUtilityColumns(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilities"
        actions={
          <CreateUtilityDialog
            facilities={facilities}
            defaultFactoryId={selectedFactoryId}
            activeType={active}
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
                <UtilitiesTrendCard data={trendMock} className="w-[92vw] max-w-[720px] shrink-0" />
                <UtilitiesComparisonCard className="w-[92vw] max-w-[520px] shrink-0" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              <UtilitiesTrendCard data={trendMock} />
              <UtilitiesComparisonCard />
            </div>
          )}

          {isMobile ? (
            <UtilitiesRecordsMobile rows={rows} onSelect={setSelected} />
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Utility records</div>
              <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={setSelected} />
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
        {selected ? <UtilityRecordDetail record={selected} /> : null}
      </DetailPanel>
    </div>
  );
}
