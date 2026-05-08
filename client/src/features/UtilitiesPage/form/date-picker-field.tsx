import * as React from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/core/app/components/ui/button";
import { Calendar } from "@/core/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/app/components/ui/popover";
import { cn } from "@/core/app/components/ui/utils";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toPickerDate(dateIso: string) {
  return new Date(`${dateIso}T12:00:00`);
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function DatePickerField({
  label,
  value,
  onChange,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? toPickerDate(value) : undefined;
  const display = selected ? format(selected, "PPP") : "Select date";
  const todayIso = React.useMemo(() => toIsoDate(new Date()), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-invalid={invalid || undefined} className={cn("w-full justify-between", !value && "text-muted-foreground", invalid && "border-destructive ring-destructive/20 ring-[3px]")}>
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
            <Button type="button" variant="ghost" size="sm" onClick={() => { onChange(todayIso); setOpen(false); }}>
              Today
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => { onChange(""); setOpen(false); }}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        <Calendar mode="single" selected={selected} onSelect={(date) => { if (date) { onChange(toIsoDate(date)); setOpen(false); } }} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
