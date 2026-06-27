import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

type WastewaterLatestCardProps = {
  record?: WastewaterRecord;
  companyName: string;
};

export function WastewaterLatestCard(props: WastewaterLatestCardProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle>Latest sample</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {props.record ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold capitalize">{props.record.point}</div>
              <div className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
                {formatDate(props.record.sampleDate)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem label="Date" value={formatDate(props.record.sampleDate)} />
              <DetailItem label="Company" value={props.companyName} />
              <DetailItem label="pH" value={String(props.record.pH)} />
              <DetailItem label="COD" value={`${props.record.COD} mg/L`} />
              <DetailItem label="BOD" value={`${props.record.BOD} mg/L`} />
              <DetailItem label="TSS" value={`${props.record.TSS} mg/L`} />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No lab sample added yet.</div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/15 p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
