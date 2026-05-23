import {
  Check,
  ChevronDown,
  ChevronRight,
  GripHorizontal,
  Pencil,
  Plus,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/primitives/dropdown-menu';
import { Input } from '@/components/ui/primitives/input';
import { useIsMobile } from '@/components/ui/primitives/use-mobile';
import { cn } from '@/components/ui/primitives/utils';
import type { DashboardWidget } from '@/core/app/state/slices/dashboard-builder.types';

import type { DashboardWidgetDefinition } from '../config/widgetDefinitions';
import { toWidgetPalette } from '../config/widgetDefinitions';

export function ContainerHeader({
  enabled,
  collapsed,
  title,
  widgetDefinitions,
  dragHandleRef,
  onAddWidget,
  onToggleCollapsed,
  onRename,
}: {
  enabled: boolean;
  collapsed: boolean;
  title: string;
  widgetDefinitions: DashboardWidgetDefinition[];
  dragHandleRef?: (node: HTMLDivElement | null) => void;
  onAddWidget: (type: DashboardWidget['type'], defaultSpan: number) => void;
  onToggleCollapsed: () => void;
  onRename: (title: string) => void;
}) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = React.useState(title);
  const [editing, setEditing] = React.useState(false);
  const widgetPalette = React.useMemo(
    () => toWidgetPalette(widgetDefinitions),
    [widgetDefinitions],
  );

  React.useEffect(() => {
    setDraft(title);
  }, [title]);

  const commitRename = React.useCallback(() => {
    const next = draft.trim() || title;
    onRename(next);
    setDraft(next);
    setEditing(false);
  }, [draft, onRename, title]);

  const actionClassName = cn(
    'flex flex-nowrap items-center gap-1 transition-opacity duration-200',
    enabled && !editing
      ? 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
      : 'opacity-100 pointer-events-auto',
  );

  const dragHandleClassName =
    'inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground/80 transition hover:bg-muted/35 hover:text-foreground cursor-grab active:cursor-grabbing touch-none opacity-100 pointer-events-auto';

  return (
    <div className="flex flex-nowrap items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
      <div className="flex min-w-0 flex-nowrap items-center gap-2">
        {enabled && !isMobile ? (
          <div
            ref={dragHandleRef}
            role="button"
            tabIndex={0}
            aria-label="Drag container"
            className={dragHandleClassName}
            title="Drag container"
          >
            <GripHorizontal className="size-3.5" />
          </div>
        ) : null}

        {enabled && editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') {
                  setDraft(title);
                  setEditing(false);
                }
              }}
              autoFocus
              className="h-7 w-[160px] rounded-lg border-border/70 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={commitRename}
              className="size-7 rounded-lg text-muted-foreground"
              aria-label="Save title"
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => enabled && setEditing(true)}
            className={cn(
              'min-w-0 truncate rounded-lg px-1.5 py-1 text-left text-xs font-semibold transition',
              enabled ? 'hover:bg-muted/30' : undefined,
            )}
            title={title}
          >
            {title}
          </button>
        )}
      </div>

      <div className={actionClassName}>
        {enabled && !editing ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground"
            onClick={() => setEditing(true)}
            aria-label="Rename container"
            title="Rename container"
          >
            <Pencil className="size-3.5" />
          </Button>
        ) : null}

        {enabled ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground"
                aria-label="Add widget"
                title="Add widget"
              >
                <Plus className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              {widgetPalette.length ? (
                widgetPalette.map((widget) => (
                  <DropdownMenuItem
                    key={widget.type}
                    asChild
                    onSelect={() =>
                      onAddWidget(widget.type, widget.defaultSpan)
                    }
                  >
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border/70 bg-card px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:border-border hover:shadow-sm"
                    >
                      <div>{widget.label}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Preview widget card
                      </div>
                    </button>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No widget configured
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-lg text-muted-foreground"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand container' : 'Collapse container'}
          title={collapsed ? 'Expand container' : 'Collapse container'}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
