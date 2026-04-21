import * as React from "react";

import { cn } from "@/app/components/ui/utils";

import { WidgetShell } from "./WidgetShell";
import { WidgetContextMenu } from "./WidgetContextMenu";
import { useWidgetDnd } from "./useWidgetDnd";
import { useWidgetResize } from "./useWidgetResize";
import { useDashboardInteraction } from "../dashboardInteraction";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ResizeHandleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-4 w-4", className)} aria-hidden="true">
      <path
        d="M6 12.5L12.5 6M9 13.5L13.5 9M3.5 11L11 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function WidgetItem({
  widgetId,
  containerId,
  index,
  enabled,
  gridRef,
  span,
  rows,
  minSpan = 1,
  maxSpan = 12,
  minRows = 1,
  maxRows = 24,
  title,
  onMove,
  onSpanChange,
  onRowsChange,
  onRemove,
  children,
}: {
  widgetId: string;
  containerId: string;
  index: number;
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  rows: number;
  minSpan?: number;
  maxSpan?: number;
  minRows?: number;
  maxRows?: number;
  title?: string;
  onMove: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
  onSpanChange: (span: number) => void;
  onRowsChange: (rows: number) => void;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const interaction = useDashboardInteraction();
  const clampedSpan = clamp(span, minSpan, maxSpan);
  const clampedRows = clamp(rows, minRows, maxRows);
  const { isResizing, startResize } = useWidgetResize({
    enabled,
    gridRef,
    span: clampedSpan,
    rows: clampedRows,
    minSpan,
    maxSpan,
    minRows,
    maxRows,
    onSpanChange,
    onRowsChange,
  });
  const { isDragging, dragRef, bindItemRef } = useWidgetDnd({
    widgetId,
    containerId,
    index,
    enabled: enabled && !isResizing,
    canDrag: true,
    onMove,
  });

  React.useEffect(() => {
    if (!enabled || !isDragging) return;
    interaction.start();
    return () => interaction.end();
  }, [enabled, isDragging, interaction]);

  React.useEffect(() => {
    if (!enabled || !isResizing) return;
    interaction.start();
    return () => interaction.end();
  }, [enabled, isResizing, interaction]);

  const body = (
    <div
      ref={bindItemRef}
      className={cn("group relative min-w-0", isDragging ? "opacity-70" : undefined)}
      style={{
        gridColumn: `span ${clampedSpan} / span ${clampedSpan}`,
        gridRow: `span ${clampedRows} / span ${clampedRows}`,
      }}
    >
      <WidgetShell enabled={enabled} title={title} dragHandleRef={dragRef}>
        {children}
      </WidgetShell>

      {enabled ? (
        <>
          <button
            type="button"
            onPointerDown={startResize("x")}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-md p-1.5",
              "cursor-ew-resize touch-none text-muted-foreground/80 hover:text-foreground",
              "opacity-0 group-hover:opacity-100",
            )}
            title="Resize width"
            role="separator"
            aria-orientation="horizontal"
          >
            <ResizeHandleIcon />
          </button>

          <button
            type="button"
            onPointerDown={startResize("y")}
            className={cn(
              "absolute bottom-2 left-1/2 -translate-x-1/2 z-10 inline-flex items-center justify-center rounded-md p-1.5",
              "cursor-ns-resize touch-none text-muted-foreground/80 hover:text-foreground",
              "opacity-0 group-hover:opacity-100",
            )}
            title="Resize height"
            role="separator"
            aria-orientation="vertical"
          >
            <ResizeHandleIcon className="rotate-90" />
          </button>

          <button
            type="button"
            onPointerDown={startResize("xy")}
            className={cn(
              "absolute bottom-2 right-2 z-10 inline-flex items-center justify-center rounded-md p-1.5",
              "cursor-nwse-resize touch-none text-muted-foreground/80 hover:text-foreground",
              "opacity-0 group-hover:opacity-100",
            )}
            title="Resize"
          >
            <ResizeHandleIcon />
          </button>
        </>
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
