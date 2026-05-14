import * as React from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@/components/ui/primitives/utils";

import { clamp } from "./dashboard-grid.helpers";
import type { DashboardGridItemProps } from "./dashboard-grid.types";
import { useDashboardGridDnd } from "./useDashboardGridDnd";
import { useDashboardGridResize } from "./useDashboardGridResize";

export function DashboardGridItem<TId extends string>({
  dndType,
  id,
  index,
  enabled,
  gridRef,
  span,
  minSpan = 1,
  maxSpan = 12,
  onMove,
  onSpanChange,
  children,
}: DashboardGridItemProps<TId>) {
  const itemRef = React.useRef<HTMLDivElement | null>(null);
  const { isResizing, startResize } = useDashboardGridResize({
    enabled,
    gridRef,
    span,
    minSpan,
    maxSpan,
    onSpanChange,
  });
  const { isDragging, dragRef, previewRef, dropRef } = useDashboardGridDnd({
    dndType,
    id,
    index,
    enabled,
    isResizing,
    itemRef,
    onMove,
  });
  const clampedSpan = clamp(span, minSpan, maxSpan);

  return (
    <div
      ref={(node) => {
        itemRef.current = node;
        previewRef(node);
        dropRef(node);
      }}
      className={cn("group relative min-w-0", isDragging ? "opacity-70" : undefined)}
      style={{ gridColumn: `span ${clampedSpan} / span ${clampedSpan}` }}
    >
      <div className={cn("min-w-0", enabled ? "rounded-xl outline-dashed outline-1 outline-border/70" : undefined)}>
        {children}
      </div>

      {enabled ? (
        <>
          <div
            ref={(node) => {
              dragRef(node);
            }}
            role="button"
            tabIndex={0}
            aria-label="Drag"
            className={cn(
              "absolute left-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-md border bg-background shadow-sm",
              "cursor-grab active:cursor-grabbing opacity-100 transition-opacity touch-none",
            )}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </div>
          <div
            onPointerDown={startResize}
            className={cn(
              "absolute bottom-2 right-2 z-10 size-8 rounded-md border bg-background shadow-sm",
              "cursor-ew-resize opacity-100 transition-opacity touch-none",
            )}
            title="Resize"
            role="separator"
            aria-orientation="horizontal"
          >
            <div className="grid h-full w-full place-items-center text-muted-foreground text-xs">↔</div>
          </div>
        </>
      ) : null}
    </div>
  );
}
