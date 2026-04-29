import * as React from "react";

import { Card } from "@/app/components/ui/card";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import type { DashboardContainer, DashboardGridRect, DashboardWidget } from "@/app/state/dashboard-builder.types";

import { useDashboardInteraction } from "../dashboardInteraction";
import type { DashboardWidgetData } from "../widgetRegistry";
import { ContainerContent } from "./ContainerContent";
import { clampRect } from "./constants";
import { ContainerContextMenu } from "./ContainerContextMenu";
import { ContainerHeader } from "./ContainerHeader";
import { useContainerDnd } from "./useContainerDnd";
import { useContainerResize } from "./use-container-resize";

export function ContainerItem(props: { container: DashboardContainer; widgets: DashboardWidget[]; enabled: boolean; canvasRef: React.RefObject<HTMLDivElement | null>; data: DashboardWidgetData; onSetContainerLayout: (layout: DashboardGridRect) => void; onToggleCollapsed: () => void; onRemoveContainer: () => void; onAddWidget: (type: DashboardWidget["type"], defaultSpan: number) => void; onMoveWidget: (widgetId: string, from: { containerId: string; index: number }, to: { containerId: string; index: number }) => void; onSpanChange: (widgetId: string, span: number) => void; onRowsChange: (widgetId: string, rows: number) => void; onRemoveWidget: (widgetId: string) => void; }) {
  const isMobile = useIsMobile();
  const interaction = useDashboardInteraction();
  const layout = clampRect(props.container.layout ?? { x: 1, y: 1, w: 12, h: 8 });
  const { isDragging, dragRef, bindItemRef } = useContainerDnd({ containerId: props.container.id, layout: { w: layout.w, h: layout.h }, enabled: props.enabled && !isMobile });
  const { isResizing, startResize } = useContainerResize({ enabled: props.enabled, canvasRef: props.canvasRef, layout, onSetContainerLayout: props.onSetContainerLayout });
  React.useEffect(() => { if (!props.enabled || !isDragging) return; interaction.start(); return () => interaction.end(); }, [props.enabled, isDragging, interaction]);
  React.useEffect(() => { if (!props.enabled || !isResizing) return; interaction.start(); return () => interaction.end(); }, [props.enabled, isResizing, interaction]);
  const collapsed = Boolean(props.container.collapsed);
  return <ContainerContextMenu title={props.container.title} collapsed={collapsed} onToggleCollapsed={props.onToggleCollapsed} onAddWidget={props.onAddWidget} onRemoveContainer={props.onRemoveContainer}><div ref={bindItemRef} className={cn("relative", isDragging ? "opacity-70" : undefined)} style={{ gridColumn: `${layout.x} / span ${layout.w}`, gridRow: `${layout.y} / span ${layout.h}` }}><Card className={cn("group shadow-xs relative flex h-full min-h-0 flex-col overflow-hidden", props.enabled ? "border-border/80" : "hover:border-border/80 hover:shadow-sm transition-shadow")}><ContainerHeader enabled={props.enabled} collapsed={collapsed} title={props.container.title} dragHandleRef={dragRef} onToggleCollapsed={props.onToggleCollapsed} onAddWidget={props.onAddWidget} onRemoveContainer={props.onRemoveContainer} />{collapsed ? null : <div className="min-h-0 flex-1 overflow-auto"><ContainerContent containerId={props.container.id} title={props.container.title} widgets={props.widgets} enabled={props.enabled} data={props.data} onMoveWidget={props.onMoveWidget} onSpanChange={props.onSpanChange} onRowsChange={props.onRowsChange} onRemoveWidget={props.onRemoveWidget} /></div>}{props.enabled && !isMobile ? <><div onPointerDown={startResize("e")} className="absolute right-0 top-10 bottom-2 w-2 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("w")} className="absolute left-0 top-10 bottom-2 w-2 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("s")} className="absolute left-2 right-2 bottom-0 h-2 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("n")} className="absolute left-2 right-2 top-10 h-2 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("se")} className="absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /></> : null}</Card></div></ContainerContextMenu>;
}
