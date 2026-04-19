import * as React from "react";

import { cn } from "@/app/components/ui/utils";

import { WidgetShell } from "./WidgetShell";
import { WidgetContextMenu } from "./WidgetContextMenu";
import { useWidgetDnd } from "./useWidgetDnd";
import { useWidgetResize } from "./useWidgetResize";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function WidgetItem({
  widgetId,
  containerId,
  index,
  enabled,
  gridRef,
  span,
  minSpan = 1,
  maxSpan = 12,
  title,
  onMove,
  onSpanChange,
  onRemove,
  children,
}: {
  widgetId: string;
  containerId: string;
  index: number;
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  minSpan?: number;
  maxSpan?: number;
  title?: string;
  onMove: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
  onSpanChange: (span: number) => void;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const clampedSpan = clamp(span, minSpan, maxSpan);
  const { isResizing, startResize } = useWidgetResize({
    enabled,
    gridRef,
    span: clampedSpan,
    minSpan,
    maxSpan,
    onSpanChange,
  });
  const { isDragging, dragRef, bindItemRef } = useWidgetDnd({
    widgetId,
    containerId,
    index,
    enabled: enabled && !isResizing,
    canDrag: true,
    onMove,
  });

  const body = (
    <div
      ref={bindItemRef}
      className={cn("group relative min-w-0", isDragging ? "opacity-70" : undefined)}
      style={{ gridColumn: `span ${clampedSpan} / span ${clampedSpan}` }}
    >
      <WidgetShell enabled={enabled} title={title} dragHandleRef={dragRef}>
        {children}
      </WidgetShell>

      {enabled ? (
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
          <div className="grid h-full w-full place-items-center text-muted-foreground text-xs">
            ↔
          </div>
        </div>
      ) : null}
    </div>
  );

  if (!enabled || !onRemove) return body;

  return (
    <WidgetContextMenu
      label={title ?? "Widget"}
      onRemove={onRemove}
      onSetSpan={(s) => onSpanChange(s)}
    >
      {body}
    </WidgetContextMenu>
  );
}
