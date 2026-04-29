import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { ResponsiveWidgetGroup } from "@/components/ResponsiveWidgetGroup";
import { TimelineList, type TimelineItem } from "@/components/TimelineList";
import type { WasteRecord } from "@/types/ems";

import { getWasteColumns } from "../columns";
import { WasteSegregationCard } from "../components/WasteSegregationCard";

export function WastePanels(props: { rows: WasteRecord[]; disposalTimeline: TimelineItem[]; }) {
  return <div className="grid gap-4 xl:grid-cols-3"><Card className="shadow-xs xl:col-span-2"><CardHeader><CardTitle>Waste table</CardTitle></CardHeader><CardContent className="pt-0"><DataTable rows={props.rows} columns={getWasteColumns()} rowKey={(item) => item.id} /></CardContent></Card><ResponsiveWidgetGroup desktopClassName="grid gap-4" mobileItemClassName="w-[min(92vw,520px)]" items={[{ key: "timeline", node: <TimelineList title="Disposal timeline" items={props.disposalTimeline} /> }, { key: "segregation", node: <WasteSegregationCard /> }]} /></div>;
}
