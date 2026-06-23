import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { WasteRecord } from "@/core/types/models/ems";

export function WasteSegregationCard({ rows }: { rows: WasteRecord[] }) {
  const hazardousStored = rows.filter((row) => row.type === "hazardous" && row.disposalStatus !== "disposed").length;
  const recyclableRows = rows.filter((row) => row.type === "recyclable").length;
  const vendorAssigned = rows.filter((row) => row.vendor?.trim()).length;

  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Segregation summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Hazardous pending disposal</span>
            <StatusBadge tone={hazardousStored > 0 ? "warning" : "compliant"}>{hazardousStored}</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>Recyclable streams logged</span>
            <StatusBadge tone={recyclableRows > 0 ? "info" : "neutral"}>{recyclableRows}</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>Vendor assigned</span>
            <StatusBadge tone={vendorAssigned === rows.length && rows.length > 0 ? "compliant" : "warning"}>
              {vendorAssigned}/{rows.length}
            </StatusBadge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
