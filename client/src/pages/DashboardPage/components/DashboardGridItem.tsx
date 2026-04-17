import * as React from "react";
import { GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

import { cn } from "@/app/components/ui/utils";

type DragItem<TId extends string> = { id: TId };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DashboardGridItem<TId extends string>({
  dndType,
  id,
  enabled,
  gridRef,
  span,
  minSpan = 1,
  maxSpan = 12,
  onMove,
  onSpanChange,
  children,
}: {
  dndType: string;
  id: TId;
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  minSpan?: number;
  maxSpan?: number;
  onMove: (from: TId, to: TId) => void;
  onSpanChange: (span: number) => void;
  children: React.ReactNode;
}) {
  const [isResizing, setIsResizing] = React.useState(false);

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: dndType,
      item: { id } satisfies DragItem<TId>,
      canDrag: enabled && !isResizing,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [dndType, id, enabled, isResizing],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: dndType,
      canDrop: () => enabled && !isResizing,
      hover: (item: DragItem<TId>) => {
        if (!enabled || isResizing) return;
        if (item.id === id) return;
        onMove(item.id, id);
        item.id = id;
      },
    }),
    [dndType, id, enabled, isResizing, onMove],
  );

  const startResize = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();
      const gridWidth = gridRef.current?.getBoundingClientRect().width ?? 0;
      if (!gridWidth) return;

      const colWidth = gridWidth / 12;
      const startX = e.clientX;
      const startSpan = clamp(span, minSpan, maxSpan);
      setIsResizing(true);

      const onMoveResize = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const next = clamp(Math.round((startSpan * colWidth + dx) / colWidth), minSpan, maxSpan);
        onSpanChange(next);
      };

      const onEnd = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", onMoveResize);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };

      window.addEventListener("pointermove", onMoveResize);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    },
    [enabled, gridRef, span, minSpan, maxSpan, onSpanChange],
  );

  return (
    <div
      ref={(node) => {
        previewRef(node);
        dropRef(node);
      }}
      className={cn(
        "group relative min-w-0",
        isDragging ? "opacity-70" : undefined,
      )}
      style={{ gridColumn: `span ${clamp(span, minSpan, maxSpan)} / span ${clamp(span, minSpan, maxSpan)}` }}
    >
      <div className={cn(enabled ? "outline-dashed outline-1 outline-border/70 rounded-xl" : undefined)}>
        {children}
      </div>

      {enabled ? (
        <>
          <button
            ref={dragRef}
            type="button"
            aria-label="Drag"
            className={cn(
              "absolute left-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-md border bg-background shadow-sm",
              "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
            )}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </button>

          <div
            onPointerDown={startResize}
            className={cn(
              "absolute bottom-2 right-2 z-10 size-8 rounded-md border bg-background shadow-sm",
              "cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity",
            )}
            title="Resize"
            role="separator"
            aria-orientation="horizontal"
          >
            <div className="grid h-full w-full place-items-center text-muted-foreground text-xs">
              ⇔
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

