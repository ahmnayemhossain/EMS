import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/primitives/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";

export function AuditCalendarToolbar(props: {
  view: "calendar" | "list";
  month: Date;
  onViewChange: (view: "calendar" | "list") => void;
  onShift: (direction: "prev" | "next") => void;
  action: React.ReactNode;
}) {
  return (
    <div className="shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={props.view} onValueChange={(value) => props.onViewChange(value === "list" ? "list" : "calendar")} className="w-full sm:w-auto">
            <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:w-[260px]">
              <TabsTrigger value="calendar" className="min-w-0 gap-2"><CalendarDays className="size-4" /><span className="truncate">Calendar</span></TabsTrigger>
              <TabsTrigger value="list" className="min-w-0 gap-2"><List className="size-4" /><span className="truncate">List</span></TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="inline-flex items-center overflow-hidden rounded-full border bg-background">
            <Button variant="outline" size="sm" onClick={() => props.onShift("prev")} aria-label="Previous"><ChevronLeft className="size-4" /></Button>
            <div className="px-3 text-sm font-semibold tracking-tight text-[var(--calendar-accent)]">{format(props.month, "MMMM yyyy")}</div>
            <Button variant="outline" size="sm" onClick={() => props.onShift("next")} aria-label="Next"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
        {props.action}
      </div>
    </div>
  );
}

