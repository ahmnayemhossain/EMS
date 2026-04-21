import * as React from "react";
import { useDragLayer } from "react-dnd";

import { cn } from "@/app/components/ui/utils";
import { useDashboardBuilder } from "@/app/state/dashboard-builder";

import { DND_CONTAINER, DND_WIDGET } from "./dndTypes";
import type { ContainerDragItem } from "./container/useContainerDnd";
import type { WidgetDragItem } from "./widget/useWidgetDnd";

const PREVIEW_COL = 56;
const PREVIEW_GAP = 16;
const PREVIEW_ROW_HEIGHT = 72;

function layerStyles(): React.CSSProperties {
  return {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 70,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  };
}

function getItemStyles(offset: { x: number; y: number } | null): React.CSSProperties {
  if (!offset) return { display: "none" };
  const transform = `translate(${offset.x}px, ${offset.y}px)`;
  return { transform, WebkitTransform: transform };
}

export function DashboardDragLayer() {
  const { widgetsById, containers } = useDashboardBuilder();

  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging) return null;

  let label: React.ReactNode = null;
  let width = 320;
  let height = 120;

  if (itemType === DND_WIDGET) {
    const dragItem = item as WidgetDragItem | null;
    const widget = dragItem ? widgetsById[dragItem.widgetId] : undefined;
    const span = widget?.span ?? 3;
    const rows = widget?.rows ?? 3;

    width = Math.max(180, Math.min(680, span * PREVIEW_COL + (span - 1) * PREVIEW_GAP));
    height = Math.max(
      84,
      Math.min(520, rows * PREVIEW_ROW_HEIGHT + (rows - 1) * PREVIEW_GAP),
    );
    label = (
      <>
        <div className="absolute right-2 top-2 text-foreground/70 text-xs">×</div>
        <div className="text-foreground/80 text-sm font-semibold">
          {span}×{rows}
        </div>
      </>
    );
  } else if (itemType === DND_CONTAINER) {
    const dragItem = item as ContainerDragItem | null;
    const container = dragItem ? containers.find((c) => c.id === dragItem.containerId) : undefined;
    const title = container?.title;
    const w = dragItem?.layout.w ?? 12;
    const h = dragItem?.layout.h ?? 8;

    width = Math.max(280, Math.min(920, w * PREVIEW_COL + (w - 1) * PREVIEW_GAP));
    height = Math.max(
      84,
      Math.min(720, h * PREVIEW_ROW_HEIGHT + (h - 1) * PREVIEW_GAP),
    );
    label = (
      <>
        <div className="absolute right-2 top-2 text-foreground/70 text-xs">×</div>
        <div className="text-foreground/80 text-sm font-semibold">{title ?? "Container"}</div>
      </>
    );
  } else {
    return null;
  }

  return (
    <div style={layerStyles()}>
      <div style={getItemStyles(currentOffset)}>
        <div
          className={cn(
            "relative rounded-xl border shadow-lg",
            "bg-rose-200/60 border-rose-400/60",
            "backdrop-blur-sm",
          )}
          style={{ width, height }}
        >
          <div className="grid h-full w-full place-items-center">{label}</div>
        </div>
      </div>
    </div>
  );
}

