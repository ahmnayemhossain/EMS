import type {
  DashboardBottomWidgetKey,
  DashboardKpiKey,
  DashboardSectionKey,
  DashboardSpanMap,
  DashboardTopWidgetKey,
} from "./dashboard-layout.types";

export const DEFAULT_KPI_ORDER: DashboardKpiKey[] = [
  "readiness",
  "openCapa",
  "expiredDocs",
  "chemicalAlerts",
  "wastePending",
  "varianceFlags",
];

export const DEFAULT_KPI_SPANS: DashboardSpanMap<DashboardKpiKey> = {
  readiness: 2,
  openCapa: 2,
  expiredDocs: 2,
  chemicalAlerts: 2,
  wastePending: 2,
  varianceFlags: 2,
};

export const DEFAULT_SECTION_ORDER: DashboardSectionKey[] = [
  "kpis",
  "topWidgets",
  "companyPerformance",
  "bottomWidgets",
];

export const DEFAULT_TOP_WIDGET_ORDER: DashboardTopWidgetKey[] = [
  "utilityTrend",
  "alerts",
  "calendar",
];

export const DEFAULT_TOP_WIDGET_SPANS: DashboardSpanMap<DashboardTopWidgetKey> = {
  utilityTrend: 8,
  alerts: 4,
  calendar: 4,
};

export const DEFAULT_BOTTOM_WIDGET_ORDER: DashboardBottomWidgetKey[] = [
  "overdueActions",
  "recentUploads",
  "expiringDocuments",
];

export const DEFAULT_BOTTOM_WIDGET_SPANS: DashboardSpanMap<DashboardBottomWidgetKey> = {
  overdueActions: 4,
  recentUploads: 4,
  expiringDocuments: 4,
};

export function arrayMove<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function clampSpan(span: number, min: number, max: number) {
  if (Number.isNaN(span)) return min;
  return Math.min(max, Math.max(min, Math.round(span)));
}

export function clampDashboardSpan(span: number) {
  return clampSpan(span, 1, 12);
}

