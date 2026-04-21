import * as React from "react";
import { useDrag } from "react-dnd";

import { DND_CONTAINER } from "../dndTypes";

export type ContainerDragItem = { containerId: string; layout: { w: number; h: number } };

export function useContainerDnd({
  containerId,
  layout,
  enabled,
}: {
  containerId: string;
  layout: { w: number; h: number };
  enabled: boolean;
}) {
  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: DND_CONTAINER,
      item: { containerId, layout } satisfies ContainerDragItem,
      canDrag: enabled,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [containerId, layout, enabled],
  );

  const bindItemRef = (node: HTMLDivElement | null) => {
    previewRef(node);
  };

  return { isDragging, dragRef, bindItemRef };
}
