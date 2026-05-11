import { useDrag, useDrop } from "react-dnd";

import type { DragItem } from "./dashboard-grid.types";

export function useDashboardGridDnd<TId extends string>({
  dndType,
  id,
  index,
  enabled,
  isResizing,
  itemRef,
  onMove,
}: {
  dndType: string;
  id: TId;
  index: number;
  enabled: boolean;
  isResizing: boolean;
  itemRef: React.RefObject<HTMLDivElement | null>;
  onMove: (from: TId, to: TId) => void;
}) {
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
        if (!enabled || isResizing || item.id === id || item.index === index) return;
        const rect = itemRef.current?.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        if (!rect || !clientOffset) return;
        const hoverMiddleY = (rect.bottom - rect.top) / 2;
        const hoverClientY = clientOffset.y - rect.top;
        if (item.index < index && hoverClientY < hoverMiddleY) return;
        if (item.index > index && hoverClientY > hoverMiddleY) return;
        onMove(item.id, id);
        item.id = id;
        item.index = index;
      },
    }),
    [dndType, id, index, enabled, isResizing, onMove],
  );

  return { isDragging, dragRef, previewRef, dropRef };
}
