import * as React from "react";

import { CardContent } from "@/app/components/ui/card";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import { MobileHScroll } from "@/components/MobileHScroll";
import { PageKpiGrid } from "@/components/PageKpiGrid";
import type { DashboardWidget } from "@/app/state/dashboard-builder.types";

import { useDashboardInteraction } from "../dashboardInteraction";
import { WidgetItem } from "../widget/WidgetItem";
import { renderDashboardWidget, type DashboardWidgetData } from "../widgetRegistry";
import { useContainerWidgetDrop } from "./useContainerWidgetDrop";

function isKpiWidget(widget: DashboardWidget | undefined) {
  return Boolean(widget?.type.startsWith("kpi:"));
}

export function ContainerContent({
  containerId,
  title,
  widgets,
  enabled,
  data,
  onMoveWidget,
  onSpanChange,
  onRowsChange,
  onRemoveWidget,
}: {
  containerId: string;
  title: string;
  widgets: DashboardWidget[];
  enabled: boolean;
  data: DashboardWidgetData;
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
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const widgetDropRef = useContainerWidgetDrop({
    enabled: enabled && !isMobile,
    containerId,
    widgetCount: widgets.length,
    onMoveWidget,
  });
  const bindDropRef = React.useMemo(
    () => widgetDropRef as unknown as React.RefCallback<HTMLDivElement>,
    [widgetDropRef],
  );

  const kpiOnly = widgets.length > 0 && widgets.every(isKpiWidget);
  const showLayoutGrid = Boolean(enabled && !isMobile);
  const layoutGridActive = Boolean(interaction.isInteracting);
  const overlayCols = 12;
  const overlayGroupSpan = 3;
  const overlayCellsPerRow = overlayCols / overlayGroupSpan; // 4
  const overlayRowHeight = 72;
  const overlayGap = 16;
  const overlayRows = Math.max(4, Math.ceil(Math.max(widgets.length, 8) / overlayCellsPerRow));

  return (
    <CardContent
      ref={bindDropRef}
      className={cn("pt-0", widgets.length ? undefined : "pb-6")}
    >
      {isMobile ? (
        kpiOnly ? (
          <PageKpiGrid>
            {widgets.map((w) => (
              <div key={w.id} className="min-w-0">
                {renderDashboardWidget(w.type, data)}
              </div>
            ))}
          </PageKpiGrid>
        ) : (
          <MobileHScroll>
            {widgets.map((w) => (
              <div key={w.id} className="w-[min(92vw,560px)] shrink-0">
                {renderDashboardWidget(w.type, data)}
              </div>
            ))}
          </MobileHScroll>
        )
      ) : (
        <div
          className={cn("relative", showLayoutGrid ? "min-h-[340px]" : undefined)}
          style={
            showLayoutGrid
              ? {
                  paddingBottom: 8,
                  minHeight: overlayRows * overlayRowHeight + (overlayRows - 1) * overlayGap,
                }
              : undefined
          }
        >
          {showLayoutGrid ? (
            <div
              aria-hidden="true"
              className="dashboard-layout-overlay"
              style={
                {
                  ["--dash-grid-cols" as never]: overlayCols,
                  ["--dash-grid-gap" as never]: `${overlayGap}px`,
                  ["--dash-grid-row-height" as never]: `${overlayRowHeight}px`,
                  opacity: layoutGridActive ? 1 : 0.28,
                } as React.CSSProperties
              }
            >
              {Array.from({ length: overlayCellsPerRow * overlayRows }).map((_, idx) => (
                <div
                  key={idx}
                  className="dashboard-layout-cell"
                  style={{ gridColumn: `span ${overlayGroupSpan} / span ${overlayGroupSpan}` }}
                >
                  +
                </div>
              ))}
            </div>
          ) : null}

          <div
            ref={gridRef}
            className="relative z-10 grid grid-cols-12 gap-4"
            style={{ gridAutoRows: "72px" }}
          >
            {widgets.map((w, wIdx) => (
              <WidgetItem
                key={w.id}
                widgetId={w.id}
                containerId={containerId}
                index={wIdx}
                enabled={enabled}
                gridRef={gridRef}
                span={w.span}
                rows={w.rows ?? 3}
                minSpan={2}
                maxSpan={12}
                minRows={1}
                maxRows={24}
                title={title}
                onMove={onMoveWidget}
                onSpanChange={(next) => onSpanChange(w.id, next)}
                onRowsChange={(next) => onRowsChange(w.id, next)}
                onRemove={() => onRemoveWidget(w.id)}
              >
                {renderDashboardWidget(w.type, data)}
              </WidgetItem>
            ))}
          </div>
        </div>
      )}

      {!widgets.length ? (
        <div className="text-muted-foreground mt-2 rounded-xl border border-dashed p-6 text-center text-sm">
          Empty container. {enabled && !isMobile ? 'Use "Add widget" to populate.' : null}
        </div>
      ) : null}
    </CardContent>
  );
}
