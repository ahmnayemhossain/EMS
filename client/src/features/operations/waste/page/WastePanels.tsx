import { ResponsiveWidgetGroup } from "@/components/layout/primitives/ResponsiveWidgetGroup";
import { TimelineList, type TimelineItem } from "@/components/layout/primitives/TimelineList";
import { DataTable } from "@/components/table/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import type { WasteRecord } from "@/core/types/models/ems";

import { WasteSegregationCard } from "../components/WasteSegregationCard";
import { getWasteColumns } from "../config/columns";

export function WastePanels(props: {
  rows: WasteRecord[];
  disposalTimeline: TimelineItem[];
  getCompanyName: (facilityId: string) => string;
  onSelect: (row: WasteRecord) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="shadow-xs xl:col-span-2">
        <CardHeader>
          <CardTitle>Waste table</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            rows={props.rows}
            columns={getWasteColumns(props.getCompanyName)}
            rowKey={(item) => item.id}
            onRowClick={props.onSelect}
          />
        </CardContent>
      </Card>

      <ResponsiveWidgetGroup
        desktopClassName="grid gap-4"
        mobileItemClassName="w-[min(92vw,520px)]"
        items={[
          { key: "timeline", node: <TimelineList title="Disposal timeline" items={props.disposalTimeline} /> },
          { key: "segregation", node: <WasteSegregationCard rows={props.rows} /> },
        ]}
      />
    </div>
  );
}
