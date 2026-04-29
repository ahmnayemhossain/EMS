import * as React from "react";

import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import { useDashboardBuilder } from "@/app/state/dashboard-builder";
import type { DashboardWidget } from "@/app/state/dashboard-builder.types";

import { DashboardInteractionProvider } from "./dashboardInteraction";
import { DashboardDragLayer } from "./DashboardDragLayer";
import { DashboardCanvasOverlay } from "./DashboardCanvasOverlay";
import { DashboardContainerGrid } from "./DashboardContainerGrid";
import { DASH_GAP, DASH_ROW_HEIGHT } from "./builder.constants";
import { useDashboardCanvasDrop } from "./useDashboardCanvasDrop";
import type { DashboardWidgetData } from "./widgetRegistry";

export function DashboardBuilder({
  enabled,
  data,
}: {
  enabled: boolean;
  data: DashboardWidgetData;
}) {
  const isMobile = useIsMobile();
  const {
    containers,
    widgetsById,
    setContainerLayout,
    toggleContainerCollapsed,
    removeContainer,
    moveWidget,
    setWidgetSpan,
    setWidgetRows,
    addWidgetToContainer,
    removeWidget,
  } = useDashboardBuilder();

  const canvasRef = React.useRef<HTMLDivElement | null>(null);

  const resolvedContainers = React.useMemo(() => {
    return containers.map((c) => ({
      ...c,
      widgets: c.widgetIds.map((id) => widgetsById[id]).filter(Boolean) as DashboardWidget[],
    }));
  }, [containers, widgetsById]);

  const showCanvas = !isMobile;
  const interactive = enabled && showCanvas;
  const overlayRows = React.useMemo(() => {
    const bottoms = containers.map((c) => {
      const y = c.layout?.y ?? 1;
      const h = c.layout?.h ?? 8;
      return y + h - 1;
    });
    return Math.max(12, ...bottoms, 12);
  }, [containers]);

  const [, canvasDropRef] = useDashboardCanvasDrop({ interactive, containers, canvasRef, setContainerLayout });

  return (
    <DashboardInteractionProvider>
      <DashboardDragLayer />
      <div
        ref={(node) => {
          canvasRef.current = node;
          canvasDropRef(node);
        }}
        className={cn("relative", showCanvas ? undefined : "space-y-4")}
        style={
          showCanvas
            ? {
                minHeight: overlayRows * DASH_ROW_HEIGHT + (overlayRows - 1) * DASH_GAP,
              }
            : undefined
        }
      >
        <DashboardCanvasOverlay rows={overlayRows} active={interactive} />

        <DashboardContainerGrid
          showCanvas={showCanvas}
          interactive={interactive}
          resolvedContainers={resolvedContainers}
          canvasRef={canvasRef}
          data={data}
          toggleContainerCollapsed={toggleContainerCollapsed}
          removeContainer={removeContainer}
          setContainerLayout={setContainerLayout}
          addWidgetToContainer={addWidgetToContainer}
          moveWidget={moveWidget}
          setWidgetSpan={setWidgetSpan}
          setWidgetRows={setWidgetRows}
          removeWidget={removeWidget}
        />
      </div>
    </DashboardInteractionProvider>
  );
}
