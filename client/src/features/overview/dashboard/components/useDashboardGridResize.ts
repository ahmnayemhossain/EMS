import * as React from "react";

import { clamp } from "./dashboard-grid.helpers";

export function useDashboardGridResize({
  enabled,
  gridRef,
  span,
  minSpan,
  maxSpan,
  onSpanChange,
}: {
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  minSpan: number;
  maxSpan: number;
  onSpanChange: (span: number) => void;
}) {
  const [isResizing, setIsResizing] = React.useState(false);

  const startResize = React.useCallback((event: React.PointerEvent) => {
    if (!enabled) return;
    event.preventDefault();
    event.stopPropagation();
    const gridWidth = gridRef.current?.getBoundingClientRect().width ?? 0;
    if (!gridWidth) return;

    const colWidth = gridWidth / 12;
    const startX = event.clientX;
    const startSpan = clamp(span, minSpan, maxSpan);
    setIsResizing(true);

    const onMoveResize = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
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
  }, [enabled, gridRef, span, minSpan, maxSpan, onSpanChange]);

  return { isResizing, startResize };
}
