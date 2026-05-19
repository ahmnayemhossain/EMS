import * as React from "react";

import { Card } from "@/components/ui/primitives/card";
import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { cn } from "@/components/ui/primitives/utils";
import type { DashboardContainer, DashboardGridRect, DashboardWidget } from "@/core/app/state/slices/dashboard-builder.types";

import { useDashboardInteraction } from "../config/dashboardInteraction";
import type { DashboardWidgetData } from "../config/widgetRegistry";
import { ContainerContent } from "./ContainerContent";
import { clampRect } from "./constants";
import { ContainerContextMenu } from "./ContainerContextMenu";
import { ContainerHeader } from "./ContainerHeader";
import { useContainerDnd } from "./useContainerDnd";
import { useContainerResize } from "./use-container-resize";

export function ContainerItem(props: { container: DashboardContainer; widgets: DashboardWidget[]; enabled: boolean; canvasRef: React.RefObject<HTMLDivElement | null>; data: DashboardWidgetData; onSetContainerLayout: (layout: DashboardGridRect) => void; onToggleCollapsed: () => void; onRename: (title: string) => void; onRemoveContainer: () => void; onAddWidget: (type: DashboardWidget["type"], defaultSpan: number) => void; onMoveWidget: (widgetId: string, from: { containerId: string; index: number }, to: { containerId: string; index: number }) => void; onSpanChange: (widgetId: string, span: number) => void; onRowsChange: (widgetId: string, rows: number) => void; onRemoveWidget: (widgetId: string) => void; }) {
  const isMobile = useIsMobile();
  const interaction = useDashboardInteraction();
  const layout = clampRect(props.container.layout ?? { x: 1, y: 1, w: 6, h: 8 });
  const { isDragging, dragRef, bindItemRef } = useContainerDnd({ containerId: props.container.id, layout: { w: layout.w, h: layout.h }, enabled: props.enabled && !isMobile });
  const { isResizing, startResize } = useContainerResize({ enabled: props.enabled, canvasRef: props.canvasRef, layout, onSetContainerLayout: props.onSetContainerLayout });
  React.useEffect(() => { if (!props.enabled || !isDragging) return; interaction.start(); return () => interaction.end(); }, [props.enabled, isDragging, interaction]);
  React.useEffect(() => { if (!props.enabled || !isResizing) return; interaction.start(); return () => interaction.end(); }, [props.enabled, isResizing, interaction]);
  const collapsed = Boolean(props.container.collapsed);
  return <ContainerContextMenu title={props.container.title} collapsed={collapsed} onToggleCollapsed={props.onToggleCollapsed} onAddWidget={props.onAddWidget} onRemoveContainer={props.onRemoveContainer}><div ref={bindItemRef} className={cn("relative", isDragging ? "opacity-70" : undefined)} style={{ gridColumn: `${layout.x} / span ${layout.w}`, gridRow: `${layout.y} / span ${layout.h}` }}><Card className={cn("group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-border/60 bg-background/90 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow]", props.enabled ? "hover:border-slate-300/80 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] dark:hover:border-slate-700/80" : undefined)}><ContainerHeader enabled={props.enabled} collapsed={collapsed} title={props.container.title} onAddWidget={props.onAddWidget} dragHandleRef={(node) => { dragRef(node); }} onToggleCollapsed={props.onToggleCollapsed} onRename={props.onRename} />{collapsed ? null : <div className="min-h-0 flex-1 overflow-auto"><ContainerContent containerId={props.container.id} title={props.container.title} widgets={props.widgets} enabled={props.enabled} data={props.data} onMoveWidget={props.onMoveWidget} onSpanChange={props.onSpanChange} onRowsChange={props.onRowsChange} onRemoveWidget={props.onRemoveWidget} onAddWidget={props.onAddWidget} /></div>}{props.enabled && !isMobile ? <><div onPointerDown={startResize("e")} className="absolute right-0 top-9 bottom-2 w-1.5 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("w")} className="absolute left-0 top-9 bottom-2 w-1.5 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("s")} className="absolute left-2 right-2 bottom-0 h-1.5 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("n")} className="absolute left-2 right-2 top-9 h-1.5 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /><div onPointerDown={startResize("se")} className="absolute right-0 bottom-0 h-3.5 w-3.5 cursor-nwse-resize touch-none opacity-0 transition-opacity group-hover:opacity-100" /></> : null}</Card></div></ContainerContextMenu>;
}

