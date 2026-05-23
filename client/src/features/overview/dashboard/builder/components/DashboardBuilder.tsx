import * as React from 'react';

import { useIsMobile } from '@/components/ui/primitives/use-mobile';
import { useDashboardBuilder } from '@/core/app/state/slices/dashboard-builder';
import type { DashboardWidget } from '@/core/app/state/slices/dashboard-builder.types';

import { DASH_GAP, DASH_ROW_HEIGHT } from '../config/builder.constants';
import { DashboardInteractionProvider } from '../config/dashboardInteraction';
import type { DashboardWidgetDefinition } from '../config/widgetDefinitions';
import { useDashboardCanvasDrop } from '../misc/useDashboardCanvasDrop';
import { DashboardContainerGrid } from './DashboardContainerGrid';
import { DashboardDragLayer } from './DashboardDragLayer';

export function DashboardBuilder({
  enabled,
  widgetDefinitions,
}: {
  enabled: boolean;
  widgetDefinitions: DashboardWidgetDefinition[];
}) {
  const isMobile = useIsMobile();
  const {
    containers,
    widgetsById,
    setContainerLayout,
    setContainerTitle,
    toggleContainerCollapsed,
    removeContainer,
    moveWidget,
    setWidgetSpan,
    setWidgetRows,
    addWidgetToContainer,
    removeWidget,
  } = useDashboardBuilder();

  const dashboardRef = React.useRef<HTMLDivElement | null>(null);
  const showDesktopGrid = !isMobile;
  const interactive = enabled && showDesktopGrid;

  const resolvedContainers = React.useMemo(() => {
    return containers.map((container) => ({
      ...container,
      widgets: container.widgetIds
        .map((id) => widgetsById[id])
        .filter(Boolean) as DashboardWidget[],
    }));
  }, [containers, widgetsById]);

  const minimumHeight = React.useMemo(() => {
    const bottomEdges = containers.map((container) => {
      const y = container.layout?.y ?? 1;
      const h = container.layout?.h ?? 8;
      return y + h - 1;
    });
    const rows = Math.max(12, ...bottomEdges, 12);
    return rows * DASH_ROW_HEIGHT + (rows - 1) * DASH_GAP;
  }, [containers]);

  const [, bindCanvasDrop] = useDashboardCanvasDrop({
    interactive,
    containers,
    canvasRef: dashboardRef,
    setContainerLayout,
  });

  return (
    <DashboardInteractionProvider>
      <DashboardDragLayer />
      <div
        ref={(node) => {
          dashboardRef.current = node;
          bindCanvasDrop(node);
        }}
        className={
          showDesktopGrid ? 'relative grid grid-cols-6 gap-3' : 'space-y-3'
        }
        style={
          showDesktopGrid
            ? { minHeight: minimumHeight, gridAutoRows: `${DASH_ROW_HEIGHT}px` }
            : undefined
        }
      >
        <DashboardContainerGrid
          showCanvas={showDesktopGrid}
          interactive={interactive}
          resolvedContainers={resolvedContainers}
          canvasRef={dashboardRef}
          widgetDefinitions={widgetDefinitions}
          toggleContainerCollapsed={toggleContainerCollapsed}
          removeContainer={removeContainer}
          setContainerLayout={setContainerLayout}
          setContainerTitle={setContainerTitle}
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
