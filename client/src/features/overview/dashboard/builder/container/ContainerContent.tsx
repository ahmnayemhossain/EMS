import { LayoutGrid } from 'lucide-react';
import * as React from 'react';

import { CardContent } from '@/components/ui/primitives/card';
import { useIsMobile } from '@/components/ui/primitives/use-mobile';
import type { DashboardWidget } from '@/core/app/state/slices/dashboard-builder.types';

import {
  renderDashboardWidget,
  toWidgetPalette,
  type DashboardWidgetDefinition,
} from '../config/widgetDefinitions';
import type { DashboardWidgetData } from '../../services/useDashboardWidgetData';
import { WidgetItem } from '../widget/WidgetItem';
import { useContainerWidgetDrop } from './useContainerWidgetDrop';

const WIDGET_ROW_HEIGHT = 48;
const WIDGET_GAP = 12;

export function ContainerContent(props: {
  containerId: string;
  widgets: DashboardWidget[];
  enabled: boolean;
  widgetDefinitions: DashboardWidgetDefinition[];
  widgetData: DashboardWidgetData;
  onMoveWidget: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
  onSpanChange: (widgetId: string, span: number) => void;
  onRowsChange: (widgetId: string, rows: number) => void;
  onRemoveWidget: (widgetId: string) => void;
  onAddWidget: (
    type: DashboardWidget['type'],
    defaultSpan: number,
    defaultRows: number,
  ) => void;
}) {
  const isMobile = useIsMobile();
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const widgetPalette = React.useMemo(
    () => toWidgetPalette(props.widgetDefinitions),
    [props.widgetDefinitions],
  );
  const widgetDropRef = useContainerWidgetDrop({
    enabled: props.enabled && !isMobile,
    containerId: props.containerId,
    widgetCount: props.widgets.length,
    onMoveWidget: props.onMoveWidget,
  });

  const bindDropRef =
    widgetDropRef as unknown as React.RefCallback<HTMLDivElement>;
  const minimumRows = props.widgets.length ? 1 : 4;
  const minimumHeight =
    minimumRows * WIDGET_ROW_HEIGHT + (minimumRows - 1) * WIDGET_GAP;

  return (
    <CardContent ref={bindDropRef} className="p-3 pt-0 pb-4">
      {props.widgets.length ? (
        <div
          ref={gridRef}
          className="grid grid-cols-6 gap-3"
          style={{
            gridAutoRows: `${WIDGET_ROW_HEIGHT}px`,
          }}
        >
          {props.widgets.map((widget, index) => (
            <WidgetItem
              key={widget.id}
              widgetId={widget.id}
              containerId={props.containerId}
              index={index}
              enabled={props.enabled}
              gridRef={gridRef}
              span={6}
              rows={widget.rows}
              minSpan={6}
              maxSpan={6}
              minRows={1}
              maxRows={12}
              title={
                props.widgetDefinitions.find(
                  (definition) => definition.id === widget.type,
                )?.name
              }
              onMove={props.onMoveWidget}
              onSpanChange={() => {}}
              onRowsChange={(rows) => props.onRowsChange(widget.id, rows)}
              onRemove={() => props.onRemoveWidget(widget.id)}
            >
              {renderDashboardWidget(
                widget.type,
                props.widgetDefinitions,
                props.widgetData,
              )}
            </WidgetItem>
          ))}
        </div>
      ) : (
        <div
          className="relative min-h-full"
          style={{ minHeight: minimumHeight }}
        >
          <div className="h-full w-full" />

          <div className="mt-1 rounded-lg border border-dashed border-slate-300/80 bg-background/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <LayoutGrid className="size-3.5 text-muted-foreground" />
                Empty container
              </div>
              <div className="text-muted-foreground text-[11px]">
                Add a widget from Settings, then place it here.
              </div>
            </div>
            {props.enabled && widgetPalette.length ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {widgetPalette.slice(0, 6).map((widget) => (
                  <button
                    key={widget.type}
                    type="button"
                    onClick={() =>
                      props.onAddWidget(
                        widget.type,
                        widget.defaultSpan,
                        widget.defaultRows,
                      )
                    }
                    className="overflow-hidden rounded-xl border border-border/70 bg-card p-3 text-left shadow-xs transition hover:border-border hover:shadow-sm"
                  >
                    <div className="text-sm font-semibold">{widget.label}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {widget.description}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </CardContent>
  );
}
