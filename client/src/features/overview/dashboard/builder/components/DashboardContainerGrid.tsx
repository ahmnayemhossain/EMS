import * as React from 'react';

import type {
  DashboardContainer,
  DashboardGridRect,
  DashboardWidget,
  DashboardWidgetLocation,
} from '@/core/app/state/slices/dashboard-builder.types';
import type { DashboardWidgetData } from '../../services/useDashboardWidgetData';
import { makeWidgetId } from '../config/builder.constants';
import type { DashboardWidgetDefinition } from '../config/widgetDefinitions';
import { ContainerItem } from '../container/ContainerItem';

export function DashboardContainerGrid({
  showCanvas,
  interactive,
  resolvedContainers,
  canvasRef,
  widgetDefinitions,
  widgetData,
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
    <>
      {resolvedContainers.map((container) => (
        <ContainerItem
          key={container.id}
          container={container}
          widgets={container.widgets}
          enabled={interactive}
          canvasRef={canvasRef}
          widgetDefinitions={widgetDefinitions}
          widgetData={widgetData}
          onToggleCollapsed={() => toggleContainerCollapsed(container.id)}
          onRemoveContainer={() => removeContainer(container.id)}
          onSetContainerLayout={(layout) =>
            setContainerLayout(container.id, layout)
          }
          onRename={(title) => setContainerTitle(container.id, title)}
          onAddWidget={(type, defaultSpan, defaultRows) =>
            addWidgetToContainer(container.id, {
              id: makeWidgetId(),
              type,
              span: defaultSpan,
              rows: defaultRows,
            })
          }
          onMoveWidget={moveWidget}
          onSpanChange={(widgetId, span) => setWidgetSpan(widgetId, span)}
          onRowsChange={(widgetId, rows) => setWidgetRows(widgetId, rows)}
          onRemoveWidget={(widgetId) => removeWidget(widgetId)}
        />
      ))}
    </>
  );
}

type DashboardContainerGridProps = {
  showCanvas: boolean;
  interactive: boolean;
  resolvedContainers: Array<
    DashboardContainer & { widgets: DashboardWidget[] }
  >;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  widgetDefinitions: DashboardWidgetDefinition[];
  widgetData: DashboardWidgetData;
  toggleContainerCollapsed: (id: string) => void;
  removeContainer: (id: string) => void;
  setContainerLayout: (id: string, layout: DashboardGridRect) => void;
  setContainerTitle: (id: string, title: string) => void;
  addWidgetToContainer: (
    id: string,
    widget: { id: string; type: string; span: number; rows: number },
  ) => void;
  moveWidget: (
    widgetId: string,
    from: DashboardWidgetLocation,
    to: DashboardWidgetLocation,
  ) => void;
  setWidgetSpan: (id: string, span: number) => void;
  setWidgetRows: (id: string, rows: number) => void;
  removeWidget: (id: string) => void;
};
