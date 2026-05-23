import * as React from 'react';

import { cn } from '@/components/ui/primitives/utils';

import { useDashboardInteraction } from '../config/dashboardInteraction';
import { useWidgetDnd } from './useWidgetDnd';
import { useWidgetResize } from './useWidgetResize';
import { clamp } from './widget-helpers';
import { WidgetContextMenu } from './WidgetContextMenu';
import { WidgetShell } from './WidgetShell';

export function WidgetItem(props: {
  widgetId: string;
  containerId: string;
  index: number;
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  rows: number;
  minSpan?: number;
  maxSpan?: number;
  minRows?: number;
  maxRows?: number;
  title?: string;
  onMove: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
  onSpanChange: (span: number) => void;
  onRowsChange: (rows: number) => void;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const interaction = useDashboardInteraction();
  const clampedSpan = clamp(
    props.span,
    props.minSpan ?? 1,
    props.maxSpan ?? 12,
  );
  const clampedRows = clamp(
    props.rows,
    props.minRows ?? 1,
    props.maxRows ?? 24,
  );
  const { isDragging, dragRef, bindItemRef } = useWidgetDnd({
    widgetId: props.widgetId,
    containerId: props.containerId,
    index: props.index,
    enabled: props.enabled,
    canDrag: true,
    onMove: props.onMove,
  });
  const { isResizing, startResize } = useWidgetResize({
    enabled: props.enabled,
    gridRef: props.gridRef,
    span: clampedSpan,
    rows: clampedRows,
    minSpan: props.minSpan ?? 1,
    maxSpan: props.maxSpan ?? 12,
    minRows: props.minRows ?? 1,
    maxRows: props.maxRows ?? 24,
    onSpanChange: props.onSpanChange,
    onRowsChange: props.onRowsChange,
  });
  React.useEffect(() => {
    if (!props.enabled || !isDragging) return;
    interaction.start();
    return () => interaction.end();
  }, [interaction, isDragging, props.enabled]);
  React.useEffect(() => {
    if (!props.enabled || !isResizing) return;
    interaction.start();
    return () => interaction.end();
  }, [interaction, isResizing, props.enabled]);

  const body = (
    <div
      ref={bindItemRef}
      className={cn(
        'group relative min-w-0',
        isDragging ? 'opacity-70' : undefined,
      )}
      style={{
        gridColumn: `span ${clampedSpan} / span ${clampedSpan}`,
        gridRow: `span ${clampedRows} / span ${clampedRows}`,
      }}
    >
      <WidgetShell
        enabled={props.enabled}
        title={props.title}
        dragHandleRef={dragRef}
        onResizePointerDown={startResize('y')}
      >
        {props.children}
      </WidgetShell>
    </div>
  );
  if (!props.enabled || !props.onRemove) return body;
  return (
    <WidgetContextMenu
      label={props.title ?? 'Widget'}
      onRemove={props.onRemove}
      onSetSpan={(span) => props.onSpanChange(span)}
    >
      {body}
    </WidgetContextMenu>
  );
}
