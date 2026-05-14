import * as React from "react";
import { useDragLayer } from "react-dnd";

import { useDashboardBuilder } from "@/core/app/state/slices/dashboard-builder";

import { DND_CONTAINER, DND_WIDGET } from "../config/dndTypes";
import { DragPreviewCard } from "./DragPreviewCard";
import type { ContainerDragItem } from "../container/useContainerDnd";
import {
  getItemStyles,
  layerStyles,
  PREVIEW_COL,
  PREVIEW_GAP,
  PREVIEW_ROW_HEIGHT,
} from "../config/drag-layer.helpers";
import { DragLayerLabel } from "../misc/drag-layer.label";
import type { WidgetDragItem } from "../widget/useWidgetDnd";

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
    height = Math.max(84, Math.min(520, rows * PREVIEW_ROW_HEIGHT + (rows - 1) * PREVIEW_GAP));
    label = <DragLayerLabel title={`${span}×${rows}`} />;
  } else if (itemType === DND_CONTAINER) {
    const dragItem = item as ContainerDragItem | null;
    const container = dragItem ? containers.find((c) => c.id === dragItem.containerId) : undefined;
    const title = container?.title;
    const w = dragItem?.layout.w ?? 12;
    const h = dragItem?.layout.h ?? 8;
    width = Math.max(280, Math.min(920, w * PREVIEW_COL + (w - 1) * PREVIEW_GAP));
    height = Math.max(84, Math.min(720, h * PREVIEW_ROW_HEIGHT + (h - 1) * PREVIEW_GAP));
    label = <DragLayerLabel title={title ?? "Container"} />;
  } else {
    return null;
  }

  return (
    <div style={layerStyles()}>
      <div style={getItemStyles(currentOffset)}>
        <DragPreviewCard width={width} height={height} label={label} />
      </div>
    </div>
  );
}
