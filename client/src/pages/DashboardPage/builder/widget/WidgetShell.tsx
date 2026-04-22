import * as React from "react";

import { cn } from "@/app/components/ui/utils";

function DotsHandle({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-1", className)} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, idx) => (
        <span key={idx} className="block size-1.5 rounded-full bg-muted-foreground/70" />
      ))}
    </div>
  );
}

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
      className={cn("relative min-w-0 h-full", enabled ? "rounded-xl ring-1 ring-border/60" : undefined)}
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
              "pointer-events-auto inline-flex size-8 items-center justify-center rounded-md",
              "bg-transparent text-muted-foreground hover:bg-muted/20",
              "cursor-grab active:cursor-grabbing touch-none",
            )}
            title={title ? `Drag • ${title}` : "Drag"}
          >
            <DotsHandle />
          </div>
        </div>
      ) : null}
    </div>
  );
}

