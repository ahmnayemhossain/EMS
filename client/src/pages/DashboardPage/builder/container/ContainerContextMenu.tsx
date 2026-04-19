import { Plus, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/app/components/ui/context-menu";
import type { DashboardWidgetType } from "@/app/state/dashboard-builder.types";

import { WIDGET_PALETTE } from "../widgetPalette";

export function ContainerContextMenu({
  title,
  collapsed,
  onToggleCollapsed,
  onAddWidget,
  onRemoveContainer,
  children,
}: {
  title: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onAddWidget: (type: DashboardWidgetType, defaultSpan: number) => void;
  onRemoveContainer: () => void;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-[240px]">
        <ContextMenuLabel>{title}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onToggleCollapsed}>
          {collapsed ? "Expand" : "Collapse"}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="size-4" />
            Add widget
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[260px]">
            {WIDGET_PALETTE.map((w) => (
              <ContextMenuItem key={w.type} onSelect={() => onAddWidget(w.type, w.defaultSpan)}>
                {w.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={onRemoveContainer}>
          <Trash2 className="size-4" />
          Remove container
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

