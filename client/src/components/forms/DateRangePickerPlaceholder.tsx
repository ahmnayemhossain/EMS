import * as React from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/primitives/popover";
import { Separator } from "@/components/ui/primitives/separator";

export function DateRangePickerPlaceholder({
  label = "Date range",
}: {
  label?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between sm:w-[220px]">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {label}
          </span>
          <span className="text-muted-foreground text-xs">Any</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-3">
        <div className="text-sm font-medium">Date range</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Placeholder UI (wire to real calendar later).
        </div>
        <Separator className="my-3" />
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>From</span>
            <span className="text-muted-foreground">â€”</span>
          </div>
          <div className="flex items-center justify-between">
            <span>To</span>
            <span className="text-muted-foreground">â€”</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


