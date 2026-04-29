import { useDrop } from "react-dnd";

import type { ContainerDragItem } from "./container/useContainerDnd";
import { DND_CONTAINER } from "./dndTypes";
import { DASH_COLS, DASH_GAP, DASH_ROW_HEIGHT } from "./builder.constants";

export function useDashboardCanvasDrop({
  interactive,
  containers,
  canvasRef,
  setContainerLayout,
}: {
  interactive: boolean;
  containers: Array<{ id: string; layout?: { x: number; y: number; w: number; h: number } }>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  setContainerLayout: (id: string, layout: { x: number; y: number; w: number; h: number }) => void;
}) {
  return useDrop(
    () => ({
      accept: DND_CONTAINER,
      canDrop: () => interactive,
      hover: (item: ContainerDragItem, monitor) => {
        if (!interactive) return;
        const source = monitor.getSourceClientOffset();
        const canvas = canvasRef.current?.getBoundingClientRect();
        if (!source || !canvas) return;
        const colWidth = (canvas.width - (DASH_COLS - 1) * DASH_GAP) / DASH_COLS;
        const relX = source.x - canvas.left;
        const relY = source.y - canvas.top;
        const nextX = Math.max(1, Math.min(DASH_COLS - item.layout.w + 1, Math.round(relX / (colWidth + DASH_GAP)) + 1));
        const nextY = Math.max(1, Math.round(relY / (DASH_ROW_HEIGHT + DASH_GAP)) + 1);
        const current = containers.find((container) => container.id === item.containerId)?.layout;
        if (current && current.x === nextX && current.y === nextY) return;
        setContainerLayout(item.containerId, { x: nextX, y: nextY, w: item.layout.w, h: item.layout.h });
      },
    }),
    [interactive, containers, setContainerLayout],
  );
}
