import * as React from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@/app/components/ui/utils";

export function WidgetShell({
  enabled,
  dragHandleRef,
  title,
  children,
}: {
  enabled: boolean;
  dragHandleRef: (node: HTMLDivElement | null) => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative min-w-0",
        enabled ? "rounded-xl outline-dashed outline-1 outline-border/70" : undefined,
      )}
    >
      {children}

      {enabled ? (
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1">
          <div
            ref={dragHandleRef}
            role="button"
            tabIndex={0}
            aria-label="Drag widget"
            className={cn(
              "pointer-events-auto inline-flex size-8 items-center justify-center rounded-md border bg-background shadow-sm",
              "cursor-grab active:cursor-grabbing touch-none",
            )}
            title={title ? `Drag • ${title}` : "Drag"}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
