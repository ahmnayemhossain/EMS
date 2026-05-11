import { useDrop } from "react-dnd";

import { DND_WIDGET } from "../config/dndTypes";
import type { WidgetDragItem } from "../widget/useWidgetDnd";

export function useContainerWidgetDrop({
  enabled,
  containerId,
  widgetCount,
  onMoveWidget,
}: {
  enabled: boolean;
  containerId: string;
  widgetCount: number;
  onMoveWidget: (
    widgetId: string,
    from: { containerId: string; index: number },
    to: { containerId: string; index: number },
  ) => void;
}) {
  const [, dropRef] = useDrop(
    () => ({
      accept: DND_WIDGET,
      canDrop: () => enabled,
      drop: (item: WidgetDragItem) => {
        if (!enabled) return;
        if (item.containerId === containerId) return;
        onMoveWidget(
          item.widgetId,
          { containerId: item.containerId, index: item.index },
          { containerId, index: widgetCount },
        );
        item.containerId = containerId;
        item.index = widgetCount;
      },
    }),
    [enabled, containerId, widgetCount, onMoveWidget],
  );

  return dropRef;
}
