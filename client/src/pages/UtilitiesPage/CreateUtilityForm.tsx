import * as React from "react";
import { CalendarDays, Paperclip } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Input } from "@/app/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";
import type { CompanyOption } from "@/app/state/company";
import type { UtilityType } from "@/types/ems";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { formatNumber, formatUtilityType } from "@/utils/format";
import {
  getDefaultUtilityUnit,
  type UtilityUsageStatus,
} from "@/pages/UtilitiesPage/baseline-settings";
import { utilityTypes } from "@/pages/UtilitiesPage/constants";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-lg border p-3">
      <div className="text-sm font-semibold">{title}</div>
      {children}
    </section>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="text-muted-foreground text-xs">
      {children}
      {required ? <span className="ml-0.5 text-destructive">*</span> : null}
    </div>
  );
}

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <div className="text-destructive text-xs">{children}</div>;
}

function statusTone(status?: UtilityUsageStatus) {
  if (status === "alert") return "critical";
  if (status === "high") return "warning";
  if (status === "watch") return "info";
  return "compliant";
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
  companies,
  companyId,
  type,
  onTypeChange,
  periodStart,
  onPeriodStartChange,
  periodEnd,
  onPeriodEndChange,
  meterName,
  onMeterNameChange,
  previousReading,
  onPreviousReadingChange,
  currentReading,
  onCurrentReadingChange,
  consumption,
  status,
  remarks,
  onRemarksChange,
  attachment,
  onAttachmentChange,
}: {
  companies: CompanyOption[];
  companyId: string;
  type: UtilityType;
  onTypeChange: (v: UtilityType) => void;
  periodStart: string;
  onPeriodStartChange: (v: string) => void;
  periodEnd: string;
  onPeriodEndChange: (v: string) => void;
  meterName: string;
  onMeterNameChange: (v: string) => void;
  previousReading: string;
  onPreviousReadingChange: (v: string) => void;
  currentReading: string;
  onCurrentReadingChange: (v: string) => void;
  consumption?: number;
  status?: UtilityUsageStatus;
  remarks: string;
  onRemarksChange: (v: string) => void;
  attachment: File | null;
  onAttachmentChange: (v: File | null) => void;
}) {
  const selectedCompany = companies.find((company) => company.id === companyId);
  const previousReadingNum = previousReading.trim() === "" ? undefined : Number(previousReading);
  const currentReadingNum = currentReading.trim() === "" ? undefined : Number(currentReading);
  const fieldErrors = {
    company: !companyId ? "Company is required." : "",
    type: !type ? "Utility type is required." : "",
    periodStart: !periodStart ? "Period start is required." : "",
    periodEnd: !periodEnd ? "Period end is required." : "",
    meterName: !meterName.trim() ? "Meter name is required." : "",
    previousReading:
      previousReading.trim() === ""
        ? "Previous reading is required."
        : typeof previousReadingNum !== "number" || Number.isNaN(previousReadingNum) || previousReadingNum < 0
          ? "Previous reading must be >= 0."
          : "",
    currentReading:
      currentReading.trim() === ""
        ? "Current reading is required."
        : typeof currentReadingNum !== "number" || Number.isNaN(currentReadingNum)
          ? "Current reading is required."
          : typeof previousReadingNum === "number" && currentReadingNum < previousReadingNum
            ? "Current reading must be >= previous reading."
            : typeof consumption === "number" && consumption <= 0
              ? "Consumption must be > 0."
              : "",
  };
  const unit = getDefaultUtilityUnit(type);

  return (
    <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1">
      <Section title="Basic Info">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <FieldLabel required>Company</FieldLabel>
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">
              {selectedCompany?.name ?? "No company assigned"}
            </div>
            <FieldError>{fieldErrors.company}</FieldError>
          </div>
          <div className="grid gap-1.5">
            <FieldLabel required>Utility Type</FieldLabel>
            <SelectFilter
              value={type}
              onChange={(v) => onTypeChange(v as UtilityType)}
              placeholder="Utility type"
              items={utilityTypes.map((t) => ({ value: t, label: formatUtilityType(t) }))}
            />
            <FieldError>{fieldErrors.type}</FieldError>
          </div>
          <div className="grid gap-1.5">
            <FieldLabel required>Period Start</FieldLabel>
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
            <FieldError>{fieldErrors.periodStart}</FieldError>
          </div>
          <div className="grid gap-1.5">
            <FieldLabel required>Period End</FieldLabel>
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
            <FieldError>{fieldErrors.periodEnd}</FieldError>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <FieldLabel required>Meter Name</FieldLabel>
            <Input
              value={meterName}
              onChange={(e) => onMeterNameChange(e.target.value)}
              placeholder="e.g. Main incomer"
            />
            <FieldError>{fieldErrors.meterName}</FieldError>
          </div>
        </div>
      </Section>

      <Section title="Meter Reading">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <FieldLabel required>Previous Reading</FieldLabel>
            <Input
              type="number"
              min={0}
              value={previousReading}
              onChange={(e) => onPreviousReadingChange(e.target.value)}
              placeholder="0"
            />
            <FieldError>{fieldErrors.previousReading}</FieldError>
          </div>
          <div className="grid gap-1.5">
            <FieldLabel required>Current Reading</FieldLabel>
            <Input
              type="number"
              min={0}
              value={currentReading}
              onChange={(e) => onCurrentReadingChange(e.target.value)}
              placeholder="0"
            />
            <FieldError>{fieldErrors.currentReading}</FieldError>
          </div>
        </div>
      </Section>

      <Section title="Calculated Result">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyField
            label="Consumption"
            value={
              typeof consumption === "number"
                ? `${formatNumber(consumption)} ${unit}`
                : "--"
            }
          />
          <ReadOnlyField
            label="Status"
            value={status ? <StatusBadge tone={statusTone(status)}>{status}</StatusBadge> : "--"}
          />
        </div>
      </Section>

      <Section title="Remarks / Attachment">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <FieldLabel>Remarks</FieldLabel>
            <Textarea
              value={remarks}
              onChange={(e) => onRemarksChange(e.target.value)}
              placeholder="Optional remarks"
            />
          </div>
          <div className="grid gap-1.5">
            <FieldLabel>Attachment</FieldLabel>
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <Paperclip className="size-4 shrink-0" />
                <span className="truncate">{attachment?.name ?? "No file selected"}</span>
              </div>
              <Input
                type="file"
                className="sm:max-w-[280px]"
                onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
