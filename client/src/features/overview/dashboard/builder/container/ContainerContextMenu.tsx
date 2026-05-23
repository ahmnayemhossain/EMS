import { Plus, Trash2 } from 'lucide-react';

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
} from '@/components/ui/primitives/context-menu';
import type { DashboardWidgetType } from '@/core/app/state/slices/dashboard-builder.types';

import {
  toWidgetPalette,
  type DashboardWidgetDefinition,
} from '../config/widgetDefinitions';

export function ContainerContextMenu({
  title,
  collapsed,
  widgetDefinitions,
  onToggleCollapsed,
  onAddWidget,
  onRemoveContainer,
  children,
}: {
  title: string;
  collapsed: boolean;
  widgetDefinitions: DashboardWidgetDefinition[];
  onToggleCollapsed: () => void;
  onAddWidget: (type: DashboardWidgetType, defaultSpan: number) => void;
  onRemoveContainer: () => void;
  children: React.ReactNode;
}) {
  const widgetPalette = toWidgetPalette(widgetDefinitions);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-[240px]">
        <ContextMenuLabel>{title}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onToggleCollapsed}>
          {collapsed ? 'Expand' : 'Collapse'}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="size-4" />
            Add widget
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[260px]">
            {widgetPalette.length ? (
              widgetPalette.map((widget) => (
                <ContextMenuItem
                  key={widget.type}
                  asChild
                  onSelect={() => onAddWidget(widget.type, widget.defaultSpan)}
                >
                  <button
                    type="button"
                    className="w-full rounded-xl border border-border/70 bg-card p-3 text-left shadow-xs transition hover:border-border hover:shadow-sm"
                  >
                    <div className="text-sm font-semibold">{widget.label}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      Preview widget card
                    </div>
                  </button>
                </ContextMenuItem>
              ))
            ) : (
              <ContextMenuItem disabled>No widget configured</ContextMenuItem>
            )}
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
