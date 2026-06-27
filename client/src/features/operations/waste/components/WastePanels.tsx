import { ResponsiveWidgetGroup } from "@/components/layout/primitives/ResponsiveWidgetGroup";
import { TimelineList, type TimelineItem } from "@/components/layout/primitives/TimelineList";
import { DataTable } from "@/components/table/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import type { WasteRecord } from "@/core/types/models/ems";

import { WasteSegregationCard } from "@/features/operations/waste/components/WasteSegregationCard";
import { getWasteColumns } from "@/features/operations/waste/config/columns";

type WastePanelsProps = {
  rows: WasteRecord[];
  disposalTimeline: TimelineItem[];
  getCompanyName: (facilityId: string) => string;
  onSelect: (row: WasteRecord) => void;
};

export function WastePanels(props: WastePanelsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="shadow-xs overflow-hidden xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b pb-4">
          <div className="min-w-0">
            <CardTitle>Waste records</CardTitle>
            <div className="text-muted-foreground mt-1 text-sm">
              Track stream, quantity, storage, vendor, and disposal status.
            </div>
          </div>
          <div className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-semibold">
            {props.rows.length} records
          </div>
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
