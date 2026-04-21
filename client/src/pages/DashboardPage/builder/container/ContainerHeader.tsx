import * as React from "react";
import { Info, MoreVertical, Plus, Trash2 } from "lucide-react";

import { CardHeader } from "@/app/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";
import type { DashboardWidgetType } from "@/app/state/dashboard-builder.types";

import { WIDGET_PALETTE } from "../widgetPalette";

function DotsHandle({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-1", className)} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, idx) => (
        <span key={idx} className="block size-1.5 rounded-full bg-muted-foreground/70" />
      ))}
    </div>
  );
}

export function ContainerHeader({
  enabled,
  collapsed,
  title,
  dragHandleRef,
  onToggleCollapsed,
  onAddWidget,
  onRemoveContainer,
}: {
  enabled: boolean;
  collapsed: boolean;
  title: string;
  dragHandleRef?: (node: HTMLDivElement | null) => void;
  onToggleCollapsed: () => void;
  onAddWidget: (type: DashboardWidgetType, defaultSpan: number) => void;
  onRemoveContainer: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <CardHeader
      className="flex-row items-center justify-between gap-3 space-y-0 border-b pb-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        {enabled && !isMobile ? (
          <div
            ref={dragHandleRef}
            role="button"
            tabIndex={0}
            aria-label="Drag container"
            className={cn(
              "inline-flex items-center justify-center",
              "cursor-grab active:cursor-grabbing touch-none",
            )}
            title="Drag"
            onClick={(e) => e.stopPropagation()}
          >
            <DotsHandle />
          </div>
        ) : null}

        {enabled ? (
          <div className="truncate text-sm font-semibold">{title}</div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <div className="truncate text-sm font-semibold">{title}</div>
            <div className="text-primary inline-flex items-center gap-1 text-xs font-medium">
              <Info className="size-3.5" />
              Info
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Container actions"
              className="grid size-8 place-items-center rounded-md bg-transparent text-muted-foreground hover:bg-muted/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuItem
              onSelect={() => {
                onToggleCollapsed();
              }}
            >
              {collapsed ? "Expand" : "Collapse"}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="size-4" />
                Add widget
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-[260px]">
                {WIDGET_PALETTE.map((w) => (
                  <DropdownMenuItem
                    key={w.type}
                    onSelect={() => onAddWidget(w.type, w.defaultSpan)}
                  >
                    {w.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onRemoveContainer()}>
              <Trash2 className="size-4" />
              Remove container
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  );
}
