import * as React from "react";
import { LayoutGrid, Plus } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { CardContent } from "@/components/ui/primitives/card";
import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { cn } from "@/components/ui/primitives/utils";
import { MobileHScroll } from "@/components/layout/primitives/MobileHScroll";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";
import type { DashboardWidget } from "@/core/app/state/slices/dashboard-builder.types";

import { useDashboardInteraction } from "../config/dashboardInteraction";
import { WidgetItem } from "../widget/WidgetItem";
import { renderDashboardWidget, type DashboardWidgetData } from "../config/widgetRegistry";
import { LayoutOverlay } from "./LayoutOverlay";
import { useContainerWidgetDrop } from "./useContainerWidgetDrop";
import { WIDGET_PALETTE } from "../config/widgetPalette";

function isKpiWidget(widget: DashboardWidget | undefined) { return Boolean(widget?.type.startsWith("kpi:")); }

export function ContainerContent(props: { containerId: string; title: string; widgets: DashboardWidget[]; enabled: boolean; data: DashboardWidgetData; onMoveWidget: (widgetId: string, from: { containerId: string; index: number }, to: { containerId: string; index: number }) => void; onSpanChange: (widgetId: string, span: number) => void; onRowsChange: (widgetId: string, rows: number) => void; onRemoveWidget: (widgetId: string) => void; onAddWidget: (type: DashboardWidget["type"], defaultSpan: number) => void; }) {
  const isMobile = useIsMobile();
  const interaction = useDashboardInteraction();
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const widgetDropRef = useContainerWidgetDrop({ enabled: props.enabled && !isMobile, containerId: props.containerId, widgetCount: props.widgets.length, onMoveWidget: props.onMoveWidget });
  const bindDropRef = widgetDropRef as unknown as React.RefCallback<HTMLDivElement>;
  const kpiOnly = props.widgets.length > 0 && props.widgets.every(isKpiWidget);
  const showLayoutGrid = Boolean(props.enabled && !isMobile);
  const overlayRows = Math.max(4, Math.ceil(Math.max(props.widgets.length, 8) / 4));
  return <CardContent ref={bindDropRef} className={cn("pt-0", props.widgets.length ? "p-3 pt-0" : "p-3 pt-0 pb-4")}>{isMobile ? (kpiOnly ? <PageKpiGrid>{props.widgets.map((widget) => <div key={widget.id} className="min-w-0">{renderDashboardWidget(widget.type, props.data)}</div>)}</PageKpiGrid> : <MobileHScroll>{props.widgets.map((widget) => <div key={widget.id} className="w-[min(92vw,560px)] shrink-0">{renderDashboardWidget(widget.type, props.data)}</div>)}</MobileHScroll>) : <div className={cn("relative", showLayoutGrid ? "min-h-[300px]" : undefined)} style={showLayoutGrid ? { paddingBottom: 6, minHeight: overlayRows * 64 + (overlayRows - 1) * 12 } : undefined}>{showLayoutGrid ? <LayoutOverlay rows={overlayRows} active={Boolean(interaction.isInteracting)} /> : null}<div ref={gridRef} className="relative z-10 grid grid-cols-12 gap-3" style={{ gridAutoRows: "64px" }}>{props.widgets.map((widget, index) => <WidgetItem key={widget.id} widgetId={widget.id} containerId={props.containerId} index={index} enabled={props.enabled} gridRef={gridRef} span={widget.span} rows={widget.rows ?? 3} minSpan={2} maxSpan={12} minRows={1} maxRows={24} title={props.title} onMove={props.onMoveWidget} onSpanChange={(next) => props.onSpanChange(widget.id, next)} onRowsChange={(next) => props.onRowsChange(widget.id, next)} onRemove={() => props.onRemoveWidget(widget.id)}>{renderDashboardWidget(widget.type, props.data)}</WidgetItem>)}</div></div>}{!props.widgets.length ? <div className="mt-1 rounded-[18px] border border-dashed border-border/70 bg-muted/[0.04] p-4"><div className="flex items-start justify-between gap-3"><div className="space-y-1"><div className="flex items-center gap-2 text-xs font-semibold"><LayoutGrid className="size-3.5 text-muted-foreground" />Empty container</div><div className="text-muted-foreground text-[11px]">Drop a widget here or use the quick actions.</div></div>{props.enabled ? <Button type="button" variant="outline" size="icon" className="size-8 rounded-xl" onClick={() => props.onAddWidget(WIDGET_PALETTE[0].type, WIDGET_PALETTE[0].defaultSpan)} aria-label="Add widget" title="Add widget"><Plus className="size-4" /></Button> : null}</div>{props.enabled ? <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{WIDGET_PALETTE.slice(0, 4).map((widget) => <button key={widget.type} type="button" onClick={() => props.onAddWidget(widget.type, widget.defaultSpan)} className="rounded-xl border border-border/60 bg-background px-3 py-2 text-left transition hover:border-slate-300 hover:bg-muted/20 dark:hover:border-slate-700"><div className="text-[11px] font-medium leading-tight">{widget.label}</div></button>)}</div> : null}</div> : null}</CardContent>;
}

