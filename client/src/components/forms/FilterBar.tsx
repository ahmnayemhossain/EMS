import * as React from "react";
import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/components/ui/primitives/utils";

export function FilterBar({
  left,
  right,
  onClear,
  className,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card shadow-xs flex flex-col gap-3 rounded-xl border p-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
        {left}
        {onClear ? (
          <Button variant="ghost" onClick={onClear} className="justify-start">
            <FilterX className="mr-2 size-4" />
            Clear
          </Button>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

