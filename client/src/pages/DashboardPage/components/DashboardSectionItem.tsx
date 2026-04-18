import * as React from "react";
import { GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

import { cn } from "@/app/components/ui/utils";

type DragItem<TId extends string> = { id: TId };

export function DashboardSectionItem<TId extends string>({
  id,
  enabled,
  onMove,
  children,
}: {
  id: TId;
  enabled: boolean;
  onMove: (from: TId, to: TId) => void;
  children: React.ReactNode;
}) {
  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: "dashboard-section",
      item: { id } satisfies DragItem<TId>,
      canDrag: enabled,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [id, enabled],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: "dashboard-section",
      canDrop: () => enabled,
      hover: (item: DragItem<TId>) => {
        if (!enabled) return;
        if (item.id === id) return;
        onMove(item.id, id);
        item.id = id;
      },
    }),
    [id, enabled, onMove],
  );

  return (
    <div
      ref={(node) => {
        previewRef(node);
        dropRef(node);
      }}
      className={cn("group relative", isDragging ? "opacity-70" : undefined)}
    >
      {enabled ? (
        <div
          ref={dragRef}
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
