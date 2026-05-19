import * as React from "react";

import { DASH_GAP, DASH_ROW_HEIGHT } from "../config/builder.constants";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useWidgetResize({
  enabled,
  gridRef,
  span,
  rows,
  minSpan,
  maxSpan,
  minRows,
  maxRows,
  onSpanChange,
  onRowsChange,
}: {
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  rows: number;
  minSpan: number;
  maxSpan: number;
  minRows: number;
  maxRows: number;
  onSpanChange: (span: number) => void;
  onRowsChange: (rows: number) => void;
}) {
  const [isResizing, setIsResizing] = React.useState(false);

  const startResize = React.useCallback(
    (axis: "x" | "y" | "xy") => (e: React.PointerEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();

      const gridWidth = gridRef.current?.getBoundingClientRect().width ?? 0;
      if (!gridWidth) return;

      const gap = DASH_GAP;
      const rowHeight = DASH_ROW_HEIGHT;
      const colWidth = (gridWidth - gap * 11) / 12;
      const colUnit = colWidth + gap;
      const rowUnit = rowHeight + gap;
      const startX = e.clientX;
      const startY = e.clientY;
      const startSpan = clamp(span, minSpan, maxSpan);
      const startRows = clamp(rows, minRows, maxRows);
      setIsResizing(true);

      const onMoveResize = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (axis === "x" || axis === "xy") {
          const startPx = startSpan * colWidth + (startSpan - 1) * gap;
          const nextSpan = clamp(Math.round((startPx + dx + gap) / colUnit), minSpan, maxSpan);
          onSpanChange(nextSpan);
        }

        if (axis === "y" || axis === "xy") {
          const startPx = startRows * rowHeight + (startRows - 1) * gap;
          const nextRows = clamp(Math.round((startPx + dy + gap) / rowUnit), minRows, maxRows);
          onRowsChange(nextRows);
        }
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
    [enabled, gridRef, span, rows, minSpan, maxSpan, minRows, maxRows, onSpanChange, onRowsChange],
  );

  return { isResizing, startResize };
}
