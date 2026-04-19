import * as React from "react";

import { Card } from "@/app/components/ui/card";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import type { DashboardContainer, DashboardWidget } from "@/app/state/dashboard-builder.types";

import type { DashboardWidgetData } from "../widgetRegistry";
import { ContainerContent } from "./ContainerContent";
import { ContainerHeader } from "./ContainerHeader";
import { ContainerContextMenu } from "./ContainerContextMenu";
import { useContainerDnd } from "./useContainerDnd";

export function ContainerItem({
  container,
  index,
  widgets,
  enabled,
  data,
  onMoveContainer,
  onToggleCollapsed,
  onRename,
  onRemoveContainer,
  onAddWidget,
  onMoveWidget,
  onSpanChange,
  onRemoveWidget,
}: {
  container: DashboardContainer;
  index: number;
  widgets: DashboardWidget[];
  enabled: boolean;
  data: DashboardWidgetData;
  onMoveContainer: (fromIndex: number, toIndex: number) => void;
  onToggleCollapsed: () => void;
  onRename: (title: string) => void;
  onRemoveContainer: () => void;
  onAddWidget: (type: DashboardWidget["type"], defaultSpan: number) => void;
  onMoveWidget: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
  onSpanChange: (widgetId: string, span: number) => void;
  onRemoveWidget: (widgetId: string) => void;
}) {
  const isMobile = useIsMobile();
  const { isDragging, dragRef, bindItemRef } = useContainerDnd({
    containerId: container.id,
    index,
    enabled: enabled && !isMobile,
    onMove: onMoveContainer,
  });

  const collapsed = Boolean(container.collapsed);

  return (
    <ContainerContextMenu
      title={container.title}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      onAddWidget={onAddWidget}
      onRemoveContainer={onRemoveContainer}
    >
      <div ref={bindItemRef} className={cn(isDragging ? "opacity-70" : undefined)}>
        <Card className={cn("shadow-xs", enabled ? "border-border/80" : undefined)}>
          <ContainerHeader
            enabled={enabled}
            collapsed={collapsed}
            title={container.title}
            dragHandleRef={dragRef}
            onToggleCollapsed={onToggleCollapsed}
            onRename={onRename}
          />
          {collapsed ? null : (
            <ContainerContent
              containerId={container.id}
              title={container.title}
              widgets={widgets}
              enabled={enabled}
              data={data}
              onMoveWidget={onMoveWidget}
              onSpanChange={onSpanChange}
              onRemoveWidget={onRemoveWidget}
            />
          )}
        </Card>
      </div>
    </ContainerContextMenu>
  );
}
