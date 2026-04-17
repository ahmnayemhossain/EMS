import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { Facility, UtilityType } from "@/types/ems";
import { SelectFilter } from "@/components/SelectFilter";
import { formatUtilityType } from "@/utils/format";
import { utilityTypes } from "@/pages/UtilitiesPage/constants";

export function CreateUtilityForm({
  facilities,
  factoryId,
  onFactoryIdChange,
  type,
  onTypeChange,
  periodStart,
  onPeriodStartChange,
  periodEnd,
  onPeriodEndChange,
  meterName,
  onMeterNameChange,
  value,
  onValueChange,
  unit,
  onUnitChange,
  min,
  onMinChange,
  remarks,
  onRemarksChange,
  belowMin,
  belowMinValues,
}: {
  facilities: Facility[];
  factoryId: string;
  onFactoryIdChange: (v: string) => void;
  type: UtilityType;
  onTypeChange: (v: UtilityType) => void;
  periodStart: string;
  onPeriodStartChange: (v: string) => void;
  periodEnd: string;
  onPeriodEndChange: (v: string) => void;
  meterName: string;
  onMeterNameChange: (v: string) => void;
  value: string;
  onValueChange: (v: string) => void;
  unit: string;
  onUnitChange: (v: string) => void;
  min: string;
  onMinChange: (v: string) => void;
  remarks: string;
  onRemarksChange: (v: string) => void;
  belowMin: boolean;
  belowMinValues: { valueNum?: number; minNum?: number };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Factory</div>
        <SelectFilter
          value={factoryId}
          onChange={(v) => onFactoryIdChange(String(v))}
          placeholder="Select factory"
          items={facilities.map((f) => ({ value: f.id, label: f.name }))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Type</div>
        <SelectFilter
          value={type}
          onChange={(v) => onTypeChange(v as UtilityType)}
          placeholder="Utility type"
          items={utilityTypes.map((t) => ({ value: t, label: formatUtilityType(t) }))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Period start</div>
        <Input type="date" value={periodStart} onChange={(e) => onPeriodStartChange(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Period end</div>
        <Input type="date" value={periodEnd} onChange={(e) => onPeriodEndChange(e.target.value)} />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Meter name</div>
        <Input
          value={meterName}
          onChange={(e) => onMeterNameChange(e.target.value)}
          placeholder="e.g. Main incomer"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Value</div>
        <Input type="number" value={value} onChange={(e) => onValueChange(e.target.value)} placeholder="0" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Unit</div>
        <Input value={unit} onChange={(e) => onUnitChange(e.target.value)} placeholder="kWh / m³ / L" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Minimum threshold (alert below)</div>
        <Input type="number" value={min} onChange={(e) => onMinChange(e.target.value)} placeholder="e.g. 1000" />
        {belowMin ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Below minimum threshold</AlertTitle>
            <AlertDescription>
              Value ({belowMinValues.valueNum}) is below minimum ({belowMinValues.minNum}). Please correct before creating.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Remarks</div>
        <Textarea value={remarks} onChange={(e) => onRemarksChange(e.target.value)} placeholder="Optional remarks" />
      </div>
    </div>
  );
}

