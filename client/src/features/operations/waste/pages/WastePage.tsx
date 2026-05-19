import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";

import { WasteCreateDialog } from "../components/WasteCreateDialog";
import { WasteKpis } from "../components/WasteKpis";
import { wasteTabs } from "../config/constants";
import { WasteFilters } from "../page/WasteFilters";
import { WastePanels } from "../page/WastePanels";
import { useWastePage } from "../page/use-waste-page";

export function WastePage() {
  const page = useWastePage();
  return (
    <div className="space-y-6">
      <WasteCreateDialog
        facilities={page.facilities}
        facilityId={page.facilityId}
        onFacilityIdChange={page.setFacilityId}
        floating
      />
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
            facilityId={page.facilityId}
            setFacilityId={page.setFacilityId}
            facilities={page.facilities}
            clear={() => {
              page.setSearch("");
              page.setFacilityId(undefined);
            }}
          />
          <WastePanels rows={page.rows} disposalTimeline={page.disposalTimeline} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

