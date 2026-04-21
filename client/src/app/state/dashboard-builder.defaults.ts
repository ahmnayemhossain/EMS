import type {
  DashboardBuilderState,
  DashboardContainer,
  DashboardGridRect,
  DashboardWidget,
  DashboardWidgetType,
} from "./dashboard-builder.types";

function makeWidgetId(type: DashboardWidgetType) {
  return `w_${type.replaceAll(":", "_")}`;
}

const WIDGETS: DashboardWidget[] = [
  { id: makeWidgetId("kpi:readiness"), type: "kpi:readiness", span: 4, rows: 2 },
  { id: makeWidgetId("kpi:openCapa"), type: "kpi:openCapa", span: 4, rows: 2 },
  { id: makeWidgetId("kpi:expiredDocs"), type: "kpi:expiredDocs", span: 4, rows: 2 },
  { id: makeWidgetId("kpi:chemicalAlerts"), type: "kpi:chemicalAlerts", span: 4, rows: 2 },
  { id: makeWidgetId("kpi:wastePending"), type: "kpi:wastePending", span: 4, rows: 2 },
  { id: makeWidgetId("kpi:varianceFlags"), type: "kpi:varianceFlags", span: 4, rows: 2 },
  { id: makeWidgetId("widget:utilityTrend"), type: "widget:utilityTrend", span: 8, rows: 4 },
  { id: makeWidgetId("widget:alerts"), type: "widget:alerts", span: 4, rows: 4 },
  { id: makeWidgetId("widget:auditCalendar"), type: "widget:auditCalendar", span: 4, rows: 4 },
  { id: makeWidgetId("widget:factoryPerformance"), type: "widget:factoryPerformance", span: 12, rows: 5 },
  { id: makeWidgetId("widget:overdueActions"), type: "widget:overdueActions", span: 4, rows: 4 },
  { id: makeWidgetId("widget:recentUploads"), type: "widget:recentUploads", span: 4, rows: 4 },
  { id: makeWidgetId("widget:expiringDocs"), type: "widget:expiringDocs", span: 4, rows: 4 },
];

export const DEFAULT_WIDGETS_BY_ID: DashboardBuilderState["widgetsById"] = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
);

export const DEFAULT_CONTAINERS: DashboardContainer[] = [
  {
    id: "c_kpis",
    title: "KPIs",
    widgetIds: WIDGETS.filter((w) => w.type.startsWith("kpi:")).map((w) => w.id),
    layout: { x: 1, y: 1, w: 12, h: 6 } satisfies DashboardGridRect,
  },
  {
    id: "c_insights",
    title: "Insights",
    widgetIds: [
      makeWidgetId("widget:utilityTrend"),
      makeWidgetId("widget:alerts"),
      makeWidgetId("widget:auditCalendar"),
      makeWidgetId("widget:factoryPerformance"),
    ],
    layout: { x: 1, y: 7, w: 12, h: 10 } satisfies DashboardGridRect,
  },
  {
    id: "c_actions",
    title: "Actions",
    widgetIds: [
      makeWidgetId("widget:overdueActions"),
      makeWidgetId("widget:recentUploads"),
      makeWidgetId("widget:expiringDocs"),
    ],
    layout: { x: 1, y: 17, w: 12, h: 8 } satisfies DashboardGridRect,
  },
];

export const DEFAULT_DASHBOARD_BUILDER_STATE: DashboardBuilderState = {
  containers: DEFAULT_CONTAINERS,
  widgetsById: DEFAULT_WIDGETS_BY_ID,
};

export function clampSpan(span: number) {
  if (!Number.isFinite(span)) return 12;
  return Math.max(1, Math.min(12, Math.round(span)));
}

export function clampRows(rows: number) {
  if (!Number.isFinite(rows)) return 3;
  return Math.max(1, Math.min(24, Math.round(rows)));
}

export function clampRect(rect: DashboardGridRect): DashboardGridRect {
  const w = Math.max(1, Math.min(12, Math.round(rect.w)));
  const x = Math.max(1, Math.min(12 - w + 1, Math.round(rect.x)));
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
