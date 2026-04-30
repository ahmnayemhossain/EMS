import * as React from "react";

import type { DashboardGridRect } from "@/core/app/state/dashboard-builder.types";

import { clampRect, DASH_COLS, DASH_GAP, DASH_ROW_HEIGHT } from "./constants";

type ResizeDir = "e" | "w" | "s" | "n" | "se";

export function useContainerResize({
  enabled, canvasRef, layout, onSetContainerLayout,
}: {
  enabled: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  layout: DashboardGridRect;
  onSetContainerLayout: (layout: DashboardGridRect) => void;
}) {
  const [isResizing, setIsResizing] = React.useState(false);
  const startResize = React.useCallback((dir: ResizeDir) => (event: React.PointerEvent) => {
    if (!enabled) return;
    event.preventDefault();
    event.stopPropagation();
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!canvas) return;
    const colUnit = (canvas.width - (DASH_COLS - 1) * DASH_GAP) / DASH_COLS + DASH_GAP;
    const rowUnit = DASH_ROW_HEIGHT + DASH_GAP;
    const startRect = layout;
    setIsResizing(true);
    const onMove = (pointerEvent: PointerEvent) => {
      const dCols = Math.round((pointerEvent.clientX - event.clientX) / colUnit);
      const dRows = Math.round((pointerEvent.clientY - event.clientY) / rowUnit);
      let next = startRect;
      if (dir === "e" || dir === "se") next = { ...next, w: startRect.w + dCols };
      if (dir === "w") next = { ...next, x: startRect.x + dCols, w: startRect.w - dCols };
      if (dir === "s" || dir === "se") next = { ...next, h: startRect.h + dRows };
      if (dir === "n") next = { ...next, y: startRect.y + dRows, h: startRect.h - dRows };
      const clamped = clampRect(next);
      if (JSON.stringify(clamped) !== JSON.stringify(layout)) onSetContainerLayout(clamped);
    };
    const onEnd = () => { setIsResizing(false); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onEnd); window.removeEventListener("pointercancel", onEnd); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }, [canvasRef, enabled, layout, onSetContainerLayout]);
  return { isResizing, startResize };
}
