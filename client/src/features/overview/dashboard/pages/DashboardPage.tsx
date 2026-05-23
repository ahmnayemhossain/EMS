import { Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/primitives/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/primitives/context-menu';
import { toast } from '@/core/app/lib/toast';
import { DndProvider } from '@/core/app/providers/DndProvider';
import { useDashboardBuilder } from '@/core/app/state/slices/dashboard-builder';
import { useUser } from '@/core/app/state/slices/user';
import {
  listDashboardWidgets,
  type DashboardWidgetEntity,
} from '@/features/admin/settings/modules/services/dashboardWidgetsApi';
import { DashboardBuilder } from '@/features/overview/dashboard/builder/components/DashboardBuilder';
import type { DashboardWidgetDefinition } from '@/features/overview/dashboard/builder/config/widgetDefinitions';
import { useDashboardWidgetData } from '@/features/overview/dashboard/services/useDashboardWidgetData';

export function DashboardPage() {
  const { userId } = useUser();
  const addContainer = useDashboardBuilder((state) => state.addContainer);
  const containers = useDashboardBuilder((state) => state.containers);
  const [loadingWidgets, setLoadingWidgets] = React.useState(true);
  const [widgetDefinitions, setWidgetDefinitions] = React.useState<
    DashboardWidgetDefinition[]
  >([]);
  const { loading: loadingData, data: widgetData } =
    useDashboardWidgetData(userId);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoadingWidgets(true);
        const rows = await listDashboardWidgets(userId);
        if (!active) return;
        setWidgetDefinitions(rows.map(toDashboardWidgetDefinition));
      } catch (error) {
        if (!active) return;
        toast.error(
          error instanceof Error
            ? error.message
            : 'Could not load dashboard widgets.',
        );
      } finally {
        if (active) setLoadingWidgets(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <DndProvider>
      <div className="space-y-3">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className="min-h-[calc(100svh-12rem)] rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(100,116,139,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.12) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {loadingWidgets || loadingData ? (
                <div className="text-muted-foreground flex h-full min-h-[calc(100svh-12rem)] items-center justify-center text-sm">
                  Loading dashboard...
                </div>
              ) : containers.length ? (
                <DashboardBuilder
                  enabled
                  widgetDefinitions={widgetDefinitions}
                  widgetData={widgetData}
                />
              ) : (
                <div className="flex h-full min-h-[calc(100svh-12rem)] flex-col items-center justify-center px-6 text-center">
                  <div className="text-sm font-semibold tracking-tight">
                    Blank dashboard
                  </div>
                  <div className="text-muted-foreground mt-2 max-w-xl text-sm">
                    Add a container, then place settings-created widgets inside it.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => addContainer('Container')}
                  >
                    <Plus className="size-4" />
                    Add container
                  </Button>
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-[220px]">
            <ContextMenuItem onSelect={() => addContainer('Container')}>
              <Plus className="size-4" />
              Add container
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </DndProvider>
  );
}

function toDashboardWidgetDefinition(
  item: DashboardWidgetEntity,
): DashboardWidgetDefinition {
  return {
    id: item.id,
    name: item.name,
    templateKey: item.templateKey,
    description: item.description,
    defaultSpan: item.defaultSpan,
    defaultRows: item.defaultRows,
    status: item.status,
  };
}
