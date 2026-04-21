import * as React from "react";

import { Card } from "@/app/components/ui/card";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import type {
  DashboardContainer,
  DashboardGridRect,
  DashboardWidget,
} from "@/app/state/dashboard-builder.types";

import { useDashboardInteraction } from "../dashboardInteraction";
import type { DashboardWidgetData } from "../widgetRegistry";
import { ContainerContent } from "./ContainerContent";
import { ContainerHeader } from "./ContainerHeader";
import { ContainerContextMenu } from "./ContainerContextMenu";
import { useContainerDnd } from "./useContainerDnd";

const DASH_COLS = 12;
const DASH_GAP = 16; // px (gap-4)
const DASH_ROW_HEIGHT = 72; // px
const MIN_W = 3;
const MIN_H = 3;

function clampRect(rect: DashboardGridRect): DashboardGridRect {
  const w = Math.max(MIN_W, Math.min(DASH_COLS, Math.round(rect.w)));
  const x = Math.max(1, Math.min(DASH_COLS - w + 1, Math.round(rect.x)));
  const h = Math.max(MIN_H, Math.min(48, Math.round(rect.h)));
  const y = Math.max(1, Math.round(rect.y));
  return { x, y, w, h };
}

type ResizeDir = "e" | "w" | "s" | "n" | "se";

export function ContainerItem({
  container,
  widgets,
  enabled,
  canvasRef,
  data,
  onSetContainerLayout,
  onToggleCollapsed,
  onRemoveContainer,
  onAddWidget,
  onMoveWidget,
  onSpanChange,
  onRowsChange,
  onRemoveWidget,
}: {
  container: DashboardContainer;
  widgets: DashboardWidget[];
  enabled: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  data: DashboardWidgetData;
  onSetContainerLayout: (layout: DashboardGridRect) => void;
  onToggleCollapsed: () => void;
  onRemoveContainer: () => void;
  onAddWidget: (type: DashboardWidget["type"], defaultSpan: number) => void;
  onMoveWidget: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
  onSpanChange: (widgetId: string, span: number) => void;
  onRowsChange: (widgetId: string, rows: number) => void;
  onRemoveWidget: (widgetId: string) => void;
}) {
  const isMobile = useIsMobile();
  const interaction = useDashboardInteraction();
  const layout = clampRect(container.layout ?? { x: 1, y: 1, w: 12, h: 8 });

  const { isDragging, dragRef, bindItemRef } = useContainerDnd({
    containerId: container.id,
    layout: { w: layout.w, h: layout.h },
    enabled: enabled && !isMobile,
  });

  const [isResizing, setIsResizing] = React.useState(false);

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

  const startResize = React.useCallback(
    (dir: ResizeDir) => (e: React.PointerEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current?.getBoundingClientRect();
      if (!canvas) return;

      const colW = (canvas.width - (DASH_COLS - 1) * DASH_GAP) / DASH_COLS;
      const colUnit = colW + DASH_GAP;
      const rowUnit = DASH_ROW_HEIGHT + DASH_GAP;

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startRect = layout;
      setIsResizing(true);

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startClientX;
        const dy = ev.clientY - startClientY;
        const dCols = Math.round(dx / colUnit);
        const dRows = Math.round(dy / rowUnit);

        let next: DashboardGridRect = startRect;
        if (dir === "e" || dir === "se") {
          next = { ...next, w: startRect.w + dCols };
        }
        if (dir === "w") {
          next = { ...next, x: startRect.x + dCols, w: startRect.w - dCols };
        }
        if (dir === "s" || dir === "se") {
          next = { ...next, h: startRect.h + dRows };
        }
        if (dir === "n") {
          next = { ...next, y: startRect.y + dRows, h: startRect.h - dRows };
        }

        const clamped = clampRect(next);
        if (
          clamped.x === layout.x &&
          clamped.y === layout.y &&
          clamped.w === layout.w &&
          clamped.h === layout.h
        ) {
          return;
        }
        onSetContainerLayout(clamped);
      };

      const onEnd = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    },
    [canvasRef, enabled, layout, onSetContainerLayout],
  );

  const collapsed = Boolean(container.collapsed);

  return (
    <ContainerContextMenu
      title={container.title}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      onAddWidget={onAddWidget}
      onRemoveContainer={onRemoveContainer}
    >
      <div
        ref={bindItemRef}
        className={cn("relative", isDragging ? "opacity-70" : undefined)}
        style={{
          gridColumn: `${layout.x} / span ${layout.w}`,
          gridRow: `${layout.y} / span ${layout.h}`,
        }}
      >
        <Card
          className={cn(
            "group shadow-xs relative flex h-full min-h-0 flex-col overflow-hidden",
            enabled ? "border-border/80" : "hover:border-border/80 hover:shadow-sm transition-shadow",
          )}
        >
          <ContainerHeader
            enabled={enabled}
            collapsed={collapsed}
            title={container.title}
            dragHandleRef={dragRef}
            onToggleCollapsed={onToggleCollapsed}
            onAddWidget={onAddWidget}
            onRemoveContainer={onRemoveContainer}
          />

          {collapsed ? null : (
            <div className="min-h-0 flex-1 overflow-auto">
              <ContainerContent
                containerId={container.id}
                title={container.title}
                widgets={widgets}
                enabled={enabled}
                data={data}
                onMoveWidget={onMoveWidget}
                onSpanChange={onSpanChange}
                onRowsChange={onRowsChange}
                onRemoveWidget={onRemoveWidget}
              />
            </div>
          )}

          {enabled && !isMobile ? (
            <>
              {/* Horizontal */}
              <div
                onPointerDown={startResize("e")}
                className="absolute right-0 top-10 bottom-2 w-2 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div
                onPointerDown={startResize("w")}
                className="absolute left-0 top-10 bottom-2 w-2 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover:opacity-100"
              />

              {/* Vertical */}
              <div
                onPointerDown={startResize("s")}
                className="absolute left-2 right-2 bottom-0 h-2 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div
                onPointerDown={startResize("n")}
                className="absolute left-2 right-2 top-10 h-2 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover:opacity-100"
              />

              {/* Corner */}
              <div
                onPointerDown={startResize("se")}
                className="absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize touch-none opacity-0 transition-opacity group-hover:opacity-100"
              />
            </>
          ) : null}
        </Card>
      </div>
    </ContainerContextMenu>
  );
}
