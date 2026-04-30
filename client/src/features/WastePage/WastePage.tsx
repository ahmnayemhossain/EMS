import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/app/components/ui/tabs";
import { PageHeader } from "@/core/components/PageHeader";

import { WasteCreateDialog } from "./components/WasteCreateDialog";
import { WasteKpis } from "./components/WasteKpis";
import { wasteTabs } from "./constants";
import { WasteFilters } from "./page/WasteFilters";
import { WastePanels } from "./page/WastePanels";
import { useWastePage } from "./page/use-waste-page";

export function WastePage() {
  const page = useWastePage();
  return <div className="space-y-6"><PageHeader actions={<WasteCreateDialog facilities={page.facilities} facilityId={page.facilityId} onFacilityIdChange={page.setFacilityId} />} /><WasteKpis rowsCount={page.rows.length} totalKgLabel={page.totalKgLabel} hazardousBacklog={page.hazardousBacklog} dueSoon={page.dueSoon} /><Tabs value={page.tab} onValueChange={page.setTab}><TabsList className="flex w-full flex-wrap justify-start">{wasteTabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList><TabsContent value={page.tab} className="mt-4 space-y-4"><WasteFilters search={page.search} setSearch={page.setSearch} facilityId={page.facilityId} setFacilityId={page.setFacilityId} facilities={page.facilities} clear={() => { page.setSearch(""); page.setFacilityId(undefined); }} /><WastePanels rows={page.rows} disposalTimeline={page.disposalTimeline} /></TabsContent></Tabs></div>;
}
