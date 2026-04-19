import * as React from "react";

import { CardContent } from "@/app/components/ui/card";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import { MobileHScroll } from "@/components/MobileHScroll";
import { PageKpiGrid } from "@/components/PageKpiGrid";
import type { DashboardWidget } from "@/app/state/dashboard-builder.types";

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
  onRemoveWidget: (widgetId: string) => void;
}) {
  const isMobile = useIsMobile();
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const widgetDropRef = useContainerWidgetDrop({
    enabled: enabled && !isMobile,
    containerId,
    widgetCount: widgets.length,
    onMoveWidget,
  });

  const kpiOnly = widgets.length > 0 && widgets.every(isKpiWidget);

  return (
    <CardContent
      ref={widgetDropRef}
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
        <div ref={gridRef} className="grid grid-cols-12 gap-4">
          {widgets.map((w, wIdx) => (
            <WidgetItem
              key={w.id}
              widgetId={w.id}
              containerId={containerId}
              index={wIdx}
              enabled={enabled}
              gridRef={gridRef}
              span={w.span}
              minSpan={2}
              maxSpan={12}
              title={title}
              onMove={onMoveWidget}
              onSpanChange={(next) => onSpanChange(w.id, next)}
              onRemove={() => onRemoveWidget(w.id)}
            >
              {renderDashboardWidget(w.type, data)}
            </WidgetItem>
          ))}
        </div>
      )}

      {!widgets.length ? (
        <div className="text-muted-foreground mt-2 rounded-xl border border-dashed p-6 text-center text-sm">
          Empty container. {enabled && !isMobile ? "Use “Add widget” to populate." : null}
        </div>
      ) : null}
    </CardContent>
  );
}

