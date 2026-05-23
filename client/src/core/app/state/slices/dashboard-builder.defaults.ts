import type {
  DashboardBuilderState,
  DashboardGridRect,
} from "./dashboard-builder.types";

export const DASHBOARD_CANVAS_COLS = 6;

export const DEFAULT_DASHBOARD_BUILDER_STATE: DashboardBuilderState = {
  containers: [],
  widgetsById: {},
};

export function clampSpan(span: number) {
  if (!Number.isFinite(span)) return 3;
  return Math.max(1, Math.min(12, Math.round(span)));
}

export function clampRows(rows: number) {
  if (!Number.isFinite(rows)) return 3;
  return Math.max(1, Math.min(24, Math.round(rows)));
}

export function clampRect(rect: DashboardGridRect): DashboardGridRect {
  const w = Math.max(1, Math.min(DASHBOARD_CANVAS_COLS, Math.round(rect.w)));
  const x = Math.max(1, Math.min(DASHBOARD_CANVAS_COLS - w + 1, Math.round(rect.x)));
  const h = Math.max(1, Math.min(48, Math.round(rect.h)));
  const y = Math.max(1, Math.round(rect.y));
  return { x, y, w, h };
}

export function arrayMove<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  if (it === undefined) return arr;
  next.splice(to, 0, it);
  return next;
}
