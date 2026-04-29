import * as React from "react";

import { ContainerItem } from "./container/ContainerItem";
import { DASH_ROW_HEIGHT, makeWidgetId } from "./builder.constants";
import type { DashboardWidgetData } from "./widgetRegistry";
import type { DashboardWidget } from "@/app/state/dashboard-builder.types";

export function DashboardContainerGrid({
  showCanvas,
  interactive,
  resolvedContainers,
  canvasRef,
  data,
  toggleContainerCollapsed,
  removeContainer,
  setContainerLayout,
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
  resolvedContainers: Array<{ id: string; widgets: DashboardWidget[]; [key: string]: any }>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  data: DashboardWidgetData;
  toggleContainerCollapsed: (id: string) => void;
  removeContainer: (id: string) => void;
  setContainerLayout: (id: string, layout: any) => void;
  addWidgetToContainer: (id: string, widget: { id: string; type: string; span: number }) => void;
  moveWidget: (sourceId: string, targetId: string) => void;
  setWidgetSpan: (id: string, span: number) => void;
  setWidgetRows: (id: string, rows: number) => void;
  removeWidget: (id: string) => void;
};
