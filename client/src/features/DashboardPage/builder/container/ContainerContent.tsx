import * as React from "react";

import { CardContent } from "@/core/app/components/ui/card";
import { useIsMobile } from "@/core/app/components/ui/use-mobile";
import { cn } from "@/core/app/components/ui/utils";
import { MobileHScroll } from "@/core/components/MobileHScroll";
import { PageKpiGrid } from "@/core/components/PageKpiGrid";
import type { DashboardWidget } from "@/core/app/state/dashboard-builder.types";

import { useDashboardInteraction } from "../dashboardInteraction";
import { WidgetItem } from "../widget/WidgetItem";
import { renderDashboardWidget, type DashboardWidgetData } from "../widgetRegistry";
import { LayoutOverlay } from "./LayoutOverlay";
import { useContainerWidgetDrop } from "./useContainerWidgetDrop";

function isKpiWidget(widget: DashboardWidget | undefined) { return Boolean(widget?.type.startsWith("kpi:")); }

export function ContainerContent(props: { containerId: string; title: string; widgets: DashboardWidget[]; enabled: boolean; data: DashboardWidgetData; onMoveWidget: (widgetId: string, from: { containerId: string; index: number }, to: { containerId: string; index: number }) => void; onSpanChange: (widgetId: string, span: number) => void; onRowsChange: (widgetId: string, rows: number) => void; onRemoveWidget: (widgetId: string) => void; }) {
  const isMobile = useIsMobile();
  const interaction = useDashboardInteraction();
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const widgetDropRef = useContainerWidgetDrop({ enabled: props.enabled && !isMobile, containerId: props.containerId, widgetCount: props.widgets.length, onMoveWidget: props.onMoveWidget });
  const bindDropRef = widgetDropRef as unknown as React.RefCallback<HTMLDivElement>;
  const kpiOnly = props.widgets.length > 0 && props.widgets.every(isKpiWidget);
  const showLayoutGrid = Boolean(props.enabled && !isMobile);
  const overlayRows = Math.max(4, Math.ceil(Math.max(props.widgets.length, 8) / 4));
  return <CardContent ref={bindDropRef} className={cn("pt-0", props.widgets.length ? undefined : "pb-6")}>{isMobile ? (kpiOnly ? <PageKpiGrid>{props.widgets.map((widget) => <div key={widget.id} className="min-w-0">{renderDashboardWidget(widget.type, props.data)}</div>)}</PageKpiGrid> : <MobileHScroll>{props.widgets.map((widget) => <div key={widget.id} className="w-[min(92vw,560px)] shrink-0">{renderDashboardWidget(widget.type, props.data)}</div>)}</MobileHScroll>) : <div className={cn("relative", showLayoutGrid ? "min-h-[340px]" : undefined)} style={showLayoutGrid ? { paddingBottom: 8, minHeight: overlayRows * 72 + (overlayRows - 1) * 16 } : undefined}>{showLayoutGrid ? <LayoutOverlay rows={overlayRows} active={Boolean(interaction.isInteracting)} /> : null}<div ref={gridRef} className="relative z-10 grid grid-cols-12 gap-4" style={{ gridAutoRows: "72px" }}>{props.widgets.map((widget, index) => <WidgetItem key={widget.id} widgetId={widget.id} containerId={props.containerId} index={index} enabled={props.enabled} gridRef={gridRef} span={widget.span} rows={widget.rows ?? 3} minSpan={2} maxSpan={12} minRows={1} maxRows={24} title={props.title} onMove={props.onMoveWidget} onSpanChange={(next) => props.onSpanChange(widget.id, next)} onRowsChange={(next) => props.onRowsChange(widget.id, next)} onRemove={() => props.onRemoveWidget(widget.id)}>{renderDashboardWidget(widget.type, props.data)}</WidgetItem>)}</div></div>}{!props.widgets.length ? <div className="text-muted-foreground mt-2 rounded-xl border border-dashed p-6 text-center text-sm">Empty container. {props.enabled && !isMobile ? 'Use "Add widget" to populate.' : null}</div> : null}</CardContent>;
}
