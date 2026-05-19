import * as React from "react";
import { GripHorizontal } from "lucide-react";

import { cn } from "@/components/ui/primitives/utils";

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
    <div className={cn("group relative h-full min-w-0", enabled ? "overflow-hidden rounded-[18px] ring-1 ring-border/50 shadow-[0_10px_28px_rgba(15,23,42,0.04)]" : undefined)}>
      {children}

      {enabled ? (
        <div
          ref={dragHandleRef}
          role="button"
          tabIndex={0}
          aria-label="Drag widget"
          className={cn(
            "absolute inset-x-2 top-2 z-10 flex h-8 items-center justify-center rounded-xl",
            "cursor-grab active:cursor-grabbing touch-none transition",
            "bg-background/55 text-muted-foreground/80 opacity-100 backdrop-blur-sm",
            "hover:bg-background/92 hover:text-foreground hover:shadow-sm",
          )}
          title={title ? `Drag • ${title}` : "Drag"}
        >
          <div
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-md",
              "bg-transparent",
            )}
          >
            <GripHorizontal className="size-3.5" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
