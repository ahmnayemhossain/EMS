import * as React from "react";
import { useDrag, useDrop } from "react-dnd";

import { DND_CONTAINER } from "../dndTypes";

export type ContainerDragItem = { containerId: string; index: number };

export function useContainerDnd({
  containerId,
  index,
  enabled,
  onMove,
}: {
  containerId: string;
  index: number;
  enabled: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
}) {
  const itemRef = React.useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: DND_CONTAINER,
      item: { containerId, index } satisfies ContainerDragItem,
      canDrag: enabled,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [containerId, index, enabled],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: DND_CONTAINER,
      canDrop: () => enabled,
      hover: (item: ContainerDragItem, monitor) => {
        if (!enabled) return;
        if (item.containerId === containerId) return;

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

        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
        item.containerId = containerId;
      },
    }),
    [containerId, index, enabled, onMove],
  );

  const bindItemRef = (node: HTMLDivElement | null) => {
    itemRef.current = node;
    previewRef(node);
    dropRef(node);
  };

  return { isDragging, dragRef, bindItemRef };
}

