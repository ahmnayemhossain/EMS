import * as React from "react";
import { CalendarDays, TriangleAlert } from "lucide-react";
import { format } from "date-fns";

import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Input } from "@/app/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";
import type { Facility, UtilityType } from "@/types/ems";
import { SelectFilter } from "@/components/SelectFilter";
import { formatUtilityType } from "@/utils/format";
import { utilityTypes } from "@/pages/UtilitiesPage/constants";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toPickerDate(dateIso: string) {
  // Use midday to avoid timezone edge cases.
  return new Date(`${dateIso}T12:00:00`);
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? toPickerDate(value) : undefined;
  const display = selected ? format(selected, "PPP") : "Select date";
  const todayIso = React.useMemo(() => toIsoDate(new Date()), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between", !value && "text-muted-foreground")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <span className="truncate">{display}</span>
          </span>
          <span className="text-muted-foreground ml-2 shrink-0 text-xs">{value || "--"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <div className="text-sm font-medium">{label}</div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(todayIso);
                setOpen(false);
              }}
            >
              Today
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (!d) return;
            onChange(toIsoDate(d));
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

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
        <DatePickerField
          label="Period start"
          value={periodStart}
          onChange={(v) => {
            onPeriodStartChange(v);
            if (v && periodEnd && v > periodEnd) {
              onPeriodEndChange(v);
            }
          }}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Period end</div>
        <DatePickerField
          label="Period end"
          value={periodEnd}
          onChange={(v) => {
            onPeriodEndChange(v);
            if (v && periodStart && v < periodStart) {
              onPeriodStartChange(v);
            }
          }}
        />
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
        <Input value={unit} onChange={(e) => onUnitChange(e.target.value)} placeholder="kWh / m\u00B3 / L" />
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
