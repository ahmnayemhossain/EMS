import * as React from "react";
import { GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

import { cn } from "@/components/ui/primitives/utils";

type DragItem<TId extends string> = { id: TId; index: number };

export function DashboardSectionItem<TId extends string>({
  id,
  index,
  enabled,
  onMove,
  children,
}: {
  id: TId;
  index: number;
  enabled: boolean;
  onMove: (from: TId, to: TId) => void;
  children: React.ReactNode;
}) {
  const itemRef = React.useRef<HTMLDivElement | null>(null);
  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: "dashboard-section",
      item: { id, index } satisfies DragItem<TId>,
      canDrag: enabled,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [id, index, enabled],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: "dashboard-section",
      canDrop: () => enabled,
      hover: (item: DragItem<TId>, monitor) => {
        if (!enabled) return;
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
    [id, index, enabled, onMove],
  );

  return (
    <div
      ref={(node) => {
        itemRef.current = node;
        previewRef(node);
        dropRef(node);
      }}
      className={cn("group relative", isDragging ? "opacity-70" : undefined)}
    >
      {enabled ? (
        <div
          ref={(node) => { dragRef(node); }}
          role="button"
          tabIndex={0}
          aria-label="Drag section"
          className={cn(
            "absolute -left-2 -top-2 z-10 inline-flex size-8 items-center justify-center rounded-md border bg-background shadow-sm",
            "cursor-grab active:cursor-grabbing opacity-100 transition-opacity",
          )}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </div>
      ) : null}

      <div className={cn(enabled ? "rounded-xl outline-dashed outline-1 outline-border/60 p-2" : undefined)}>
        {children}
      </div>
    </div>
  );
}

