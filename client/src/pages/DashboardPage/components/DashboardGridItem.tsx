import * as React from "react";
import { GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

import { cn } from "@/app/components/ui/utils";

type DragItem<TId extends string> = { id: TId; index: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DashboardGridItem<TId extends string>({
  dndType,
  id,
  index,
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
  index: number;
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
  const itemRef = React.useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: dndType,
      item: { id, index } satisfies DragItem<TId>,
      canDrag: enabled && !isResizing,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [dndType, id, index, enabled, isResizing],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: dndType,
      canDrop: () => enabled && !isResizing,
      hover: (item: DragItem<TId>, monitor) => {
        if (!enabled || isResizing) return;
        if (item.id === id) return;

        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;

        const rect = itemRef.current?.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        if (!rect || !clientOffset) return;

        const hoverMiddleY = (rect.bottom - rect.top) / 2;
        const hoverClientY = clientOffset.y - rect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        onMove(item.id, id);
        item.id = id;
        item.index = hoverIndex;
      },
    }),
    [dndType, id, index, enabled, isResizing, onMove],
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
        const next = clamp(
          Math.round((startSpan * colWidth + dx) / colWidth),
          minSpan,
          maxSpan,
        );
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

  const clampedSpan = clamp(span, minSpan, maxSpan);

  return (
    <div
      ref={(node) => {
        itemRef.current = node;
        previewRef(node);
        dropRef(node);
      }}
      className={cn("group relative min-w-0", isDragging ? "opacity-70" : undefined)}
      style={{ gridColumn: `span ${clampedSpan} / span ${clampedSpan}` }}
    >
      <div
        className={cn(
          "min-w-0",
          enabled ? "rounded-xl outline-dashed outline-1 outline-border/70" : undefined,
        )}
      >
        {children}
      </div>

      {enabled ? (
        <>
          <div
            ref={dragRef}
            role="button"
            tabIndex={0}
            aria-label="Drag"
            className={cn(
              "absolute left-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-md border bg-background shadow-sm",
              "cursor-grab active:cursor-grabbing opacity-100 transition-opacity touch-none",
            )}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </div>

          <div
            onPointerDown={startResize}
            className={cn(
              "absolute bottom-2 right-2 z-10 size-8 rounded-md border bg-background shadow-sm",
              "cursor-ew-resize opacity-100 transition-opacity touch-none",
            )}
            title="Resize"
            role="separator"
            aria-orientation="horizontal"
          >
            <div className="grid h-full w-full place-items-center text-muted-foreground text-xs">
              ↔
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

