import * as React from "react";
import { useDrag, useDrop } from "react-dnd";

import { DND_WIDGET } from "../dndTypes";

export type WidgetDragItem = {
  widgetId: string;
  containerId: string;
  index: number;
};

export function useWidgetDnd({
  widgetId,
  containerId,
  index,
  enabled,
  canDrag,
  onMove,
}: {
  widgetId: string;
  containerId: string;
  index: number;
  enabled: boolean;
  canDrag: boolean;
  onMove: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
}) {
  const itemRef = React.useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: DND_WIDGET,
      item: { widgetId, containerId, index } satisfies WidgetDragItem,
      canDrag: enabled && canDrag,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [widgetId, containerId, index, enabled, canDrag],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: DND_WIDGET,
      canDrop: () => enabled,
      hover: (item: WidgetDragItem, monitor) => {
        if (!enabled) return;
        if (item.widgetId === widgetId && item.containerId === containerId) return;

        const dragIndex = item.index;
        const hoverIndex = index;
        const sameContainer = item.containerId === containerId;

        const rect = itemRef.current?.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        if (!rect || !clientOffset) return;

        const hoverMiddleY = (rect.bottom - rect.top) / 2;
        const hoverClientY = clientOffset.y - rect.top;

        if (sameContainer) {
          if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
          if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
        }

        onMove(
          item.widgetId,
          { containerId: item.containerId, index: item.index },
          { containerId, index: hoverIndex },
        );
        item.containerId = containerId;
        item.index = hoverIndex;
      },
    }),
    [enabled, widgetId, containerId, index, onMove],
  );

  const bindItemRef = (node: HTMLDivElement | null) => {
    itemRef.current = node;
    previewRef(node);
    dropRef(node);
  };

  return { isDragging, dragRef, bindItemRef };
}

