import * as React from "react";
import { useDrop } from "react-dnd";

import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import { useDashboardBuilder } from "@/app/state/dashboard-builder";
import type { DashboardWidget } from "@/app/state/dashboard-builder.types";

import { ContainerItem } from "./container/ContainerItem";
import type { ContainerDragItem } from "./container/useContainerDnd";
import { DND_CONTAINER } from "./dndTypes";
import { DashboardInteractionProvider, useDashboardInteraction } from "./dashboardInteraction";
import { DashboardDragLayer } from "./DashboardDragLayer";
import type { DashboardWidgetData } from "./widgetRegistry";

function makeWidgetId() {
  return `w_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const DASH_COLS = 12;
const DASH_GAP = 16; // px (gap-4)
const DASH_ROW_HEIGHT = 72; // px
const DASH_GROUP_SPAN = 3; // 4 tiles per row

function DashboardCanvasOverlay({ rows, active }: { rows: number; active: boolean }) {
  const interaction = useDashboardInteraction();
  const opacity = interaction.isInteracting ? 1 : active ? 0.28 : 0;

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="dashboard-layout-overlay"
      style={
        {
          ["--dash-grid-cols" as never]: DASH_COLS,
          ["--dash-grid-gap" as never]: `${DASH_GAP}px`,
          ["--dash-grid-row-height" as never]: `${DASH_ROW_HEIGHT}px`,
          opacity,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: (DASH_COLS / DASH_GROUP_SPAN) * rows }).map((_, idx) => (
        <div
          key={idx}
          className="dashboard-layout-cell"
          style={{ gridColumn: `span ${DASH_GROUP_SPAN} / span ${DASH_GROUP_SPAN}` }}
        >
          +
        </div>
      ))}
    </div>
  );
}

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

  const [, canvasDropRef] = useDrop(
    () => ({
      accept: DND_CONTAINER,
      canDrop: () => interactive,
      hover: (item: ContainerDragItem, monitor) => {
        if (!interactive) return;
        const source = monitor.getSourceClientOffset();
        const canvas = canvasRef.current?.getBoundingClientRect();
        if (!source || !canvas) return;

        const colW = (canvas.width - (DASH_COLS - 1) * DASH_GAP) / DASH_COLS;
        const colUnit = colW + DASH_GAP;
        const rowUnit = DASH_ROW_HEIGHT + DASH_GAP;

        const relX = source.x - canvas.left;
        const relY = source.y - canvas.top;

        const nextX = Math.max(
          1,
          Math.min(DASH_COLS - item.layout.w + 1, Math.round(relX / colUnit) + 1),
        );
        const nextY = Math.max(1, Math.round(relY / rowUnit) + 1);

        const current = containers.find((c) => c.id === item.containerId)?.layout;
        if (current && current.x === nextX && current.y === nextY) return;
        setContainerLayout(item.containerId, {
          x: nextX,
          y: nextY,
          w: item.layout.w,
          h: item.layout.h,
        });
      },
    }),
    [interactive, containers, setContainerLayout],
  );

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

        <div
          className={cn("relative z-10", showCanvas ? "grid grid-cols-12 gap-4" : "space-y-4")}
          style={showCanvas ? { gridAutoRows: `${DASH_ROW_HEIGHT}px` } : undefined}
        >
          {resolvedContainers.map((c) => (
            <ContainerItem
              key={c.id}
              container={c}
              widgets={c.widgets}
              enabled={interactive}
              canvasRef={canvasRef}
              data={data}
              onToggleCollapsed={() => toggleContainerCollapsed(c.id)}
              onRemoveContainer={() => removeContainer(c.id)}
              onSetContainerLayout={(layout) => setContainerLayout(c.id, layout)}
              onAddWidget={(type, defaultSpan) => {
                addWidgetToContainer(c.id, { id: makeWidgetId(), type, span: defaultSpan });
              }}
              onMoveWidget={moveWidget}
              onSpanChange={(widgetId, span) => setWidgetSpan(widgetId, span)}
              onRowsChange={(widgetId, rows) => setWidgetRows(widgetId, rows)}
              onRemoveWidget={(widgetId) => removeWidget(widgetId)}
            />
          ))}
        </div>
      </div>
    </DashboardInteractionProvider>
  );
}
