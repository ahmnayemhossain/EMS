import * as React from "react";
import { Download, Plus } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { cn } from "@/core/app/components/ui/utils";

export function TableToolbar({
  title,
  description,
  left,
  right,
  onAdd,
  onExport,
  className,
}: {
  title: string;
  description?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onAdd?: () => void;
  onExport?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <div className="text-base font-semibold">{title}</div>
        {description ? (
          <div className="text-muted-foreground mt-1 text-sm">{description}</div>
        ) : null}
        {left ? <div className="mt-3">{left}</div> : null}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {onExport ? (
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        ) : null}
        {onAdd ? (
          <Button onClick={onAdd}>
            <Plus className="mr-2 size-4" />
            Add
          </Button>
        ) : null}
      </div>
    </div>
  );
}

