import type { DashboardGridRect } from "@/app/state/dashboard-builder.types";

export const DASH_COLS = 12;
export const DASH_GAP = 16;
export const DASH_ROW_HEIGHT = 72;
export const MIN_W = 3;
export const MIN_H = 3;

export function clampRect(rect: DashboardGridRect): DashboardGridRect {
  const w = Math.max(MIN_W, Math.min(DASH_COLS, Math.round(rect.w)));
  const x = Math.max(1, Math.min(DASH_COLS - w + 1, Math.round(rect.x)));
  const h = Math.max(MIN_H, Math.min(48, Math.round(rect.h)));
  const y = Math.max(1, Math.round(rect.y));
  return { x, y, w, h };
}
