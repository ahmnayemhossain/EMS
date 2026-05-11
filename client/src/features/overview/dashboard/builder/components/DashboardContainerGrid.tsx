import * as React from "react";

import { ContainerItem } from "../container/ContainerItem";
import { DASH_ROW_HEIGHT, makeWidgetId } from "../config/builder.constants";
import type { DashboardWidgetData } from "../config/widgetRegistry";
import type { DashboardContainer, DashboardGridRect, DashboardWidget, DashboardWidgetLocation } from "@/core/app/state/slices/dashboard-builder.types";

export function DashboardContainerGrid({
  showCanvas,
  interactive,
  resolvedContainers,
  canvasRef,
  data,
  toggleContainerCollapsed,
  removeContainer,
  setContainerLayout,
  setContainerTitle,
  addWidgetToContainer,
  moveWidget,
  setWidgetSpan,
  setWidgetRows,
  removeWidget,
}: DashboardContainerGridProps) {
  return (
    <div className={showCanvas ? "relative z-10 grid grid-cols-12 gap-4" : "relative z-10 space-y-4"} style={showCanvas ? { gridAutoRows: `${DASH_ROW_HEIGHT}px` } : undefined}>
      {resolvedContainers.map((container) => (
        <ContainerItem
          key={container.id}
          container={container}
          widgets={container.widgets}
          enabled={interactive}
          canvasRef={canvasRef}
          data={data}
          onToggleCollapsed={() => toggleContainerCollapsed(container.id)}
          onRemoveContainer={() => removeContainer(container.id)}
          onSetContainerLayout={(layout) => setContainerLayout(container.id, layout)}
          onRename={(title) => setContainerTitle(container.id, title)}
          onAddWidget={(type, defaultSpan) => addWidgetToContainer(container.id, { id: makeWidgetId(), type, span: defaultSpan })}
          onMoveWidget={moveWidget}
          onSpanChange={(widgetId, span) => setWidgetSpan(widgetId, span)}
          onRowsChange={(widgetId, rows) => setWidgetRows(widgetId, rows)}
          onRemoveWidget={(widgetId) => removeWidget(widgetId)}
        />
      ))}
    </div>
  );
}

type DashboardContainerGridProps = {
  showCanvas: boolean;
  interactive: boolean;
  resolvedContainers: Array<DashboardContainer & { widgets: DashboardWidget[] }>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  data: DashboardWidgetData;
  toggleContainerCollapsed: (id: string) => void;
  removeContainer: (id: string) => void;
  setContainerLayout: (id: string, layout: DashboardGridRect) => void;
  setContainerTitle: (id: string, title: string) => void;
  addWidgetToContainer: (id: string, widget: { id: string; type: string; span: number }) => void;
  moveWidget: (widgetId: string, from: DashboardWidgetLocation, to: DashboardWidgetLocation) => void;
  setWidgetSpan: (id: string, span: number) => void;
  setWidgetRows: (id: string, rows: number) => void;
  removeWidget: (id: string) => void;
};
