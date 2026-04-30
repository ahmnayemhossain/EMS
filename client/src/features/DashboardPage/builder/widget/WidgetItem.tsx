import * as React from "react";

import { cn } from "@/core/app/components/ui/utils";

import { useDashboardInteraction } from "../dashboardInteraction";
import { WidgetContextMenu } from "./WidgetContextMenu";
import { useWidgetDnd } from "./useWidgetDnd";
import { useWidgetResize } from "./useWidgetResize";
import { ResizeHandleIcon } from "./ResizeHandleIcon";
import { clamp } from "./widget-helpers";
import { WidgetShell } from "./WidgetShell";

export function WidgetItem(props: { widgetId: string; containerId: string; index: number; enabled: boolean; gridRef: React.RefObject<HTMLElement | null>; span: number; rows: number; minSpan?: number; maxSpan?: number; minRows?: number; maxRows?: number; title?: string; onMove: (widgetId: string, from: { containerId: string; index: number }, to: { containerId: string; index: number }) => void; onSpanChange: (span: number) => void; onRowsChange: (rows: number) => void; onRemove?: () => void; children: React.ReactNode; }) {
  const interaction = useDashboardInteraction();
  const clampedSpan = clamp(props.span, props.minSpan ?? 1, props.maxSpan ?? 12);
  const clampedRows = clamp(props.rows, props.minRows ?? 1, props.maxRows ?? 24);
  const { isResizing, startResize } = useWidgetResize({ enabled: props.enabled, gridRef: props.gridRef, span: clampedSpan, rows: clampedRows, minSpan: props.minSpan ?? 1, maxSpan: props.maxSpan ?? 12, minRows: props.minRows ?? 1, maxRows: props.maxRows ?? 24, onSpanChange: props.onSpanChange, onRowsChange: props.onRowsChange });
  const { isDragging, dragRef, bindItemRef } = useWidgetDnd({ widgetId: props.widgetId, containerId: props.containerId, index: props.index, enabled: props.enabled && !isResizing, canDrag: true, onMove: props.onMove });
  React.useEffect(() => { if (!props.enabled || !isDragging) return; interaction.start(); return () => interaction.end(); }, [interaction, isDragging, props.enabled]);
  React.useEffect(() => { if (!props.enabled || !isResizing) return; interaction.start(); return () => interaction.end(); }, [interaction, isResizing, props.enabled]);
  const body = <div ref={bindItemRef} className={cn("group relative min-w-0", isDragging ? "opacity-70" : undefined)} style={{ gridColumn: `span ${clampedSpan} / span ${clampedSpan}`, gridRow: `span ${clampedRows} / span ${clampedRows}` }}><WidgetShell enabled={props.enabled} title={props.title} dragHandleRef={dragRef}>{props.children}</WidgetShell>{props.enabled ? <><div onPointerDown={startResize("x")} className={cn("absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-md p-1.5", "cursor-ew-resize touch-none text-muted-foreground/80 hover:text-foreground", "opacity-0 group-hover:opacity-100")} title="Resize width" role="separator" aria-orientation="horizontal"><ResizeHandleIcon /></div><div onPointerDown={startResize("y")} className={cn("absolute bottom-2 left-1/2 -translate-x-1/2 z-10 inline-flex items-center justify-center rounded-md p-1.5", "cursor-ns-resize touch-none text-muted-foreground/80 hover:text-foreground", "opacity-0 group-hover:opacity-100")} title="Resize height" role="separator" aria-orientation="vertical"><ResizeHandleIcon className="rotate-90" /></div><div onPointerDown={startResize("xy")} className={cn("absolute bottom-2 right-2 z-10 inline-flex items-center justify-center rounded-md p-1.5", "cursor-nwse-resize touch-none text-muted-foreground/80 hover:text-foreground", "opacity-0 group-hover:opacity-100")} title="Resize"><ResizeHandleIcon /></div></> : null}</div>;
  if (!props.enabled || !props.onRemove) return body;
  return <WidgetContextMenu label={props.title ?? "Widget"} onRemove={props.onRemove} onSetSpan={(span) => props.onSpanChange(span)}>{body}</WidgetContextMenu>;
}
