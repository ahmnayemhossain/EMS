import type {
  DashboardBuilderState,
  DashboardContainer,
  DashboardWidget,
  DashboardWidgetType,
} from "./dashboard-builder.types";

function makeWidgetId(type: DashboardWidgetType) {
  return `w_${type.replaceAll(":", "_")}`;
}

const WIDGETS: DashboardWidget[] = [
  { id: makeWidgetId("kpi:readiness"), type: "kpi:readiness", span: 4 },
  { id: makeWidgetId("kpi:openCapa"), type: "kpi:openCapa", span: 4 },
  { id: makeWidgetId("kpi:expiredDocs"), type: "kpi:expiredDocs", span: 4 },
  { id: makeWidgetId("kpi:chemicalAlerts"), type: "kpi:chemicalAlerts", span: 4 },
  { id: makeWidgetId("kpi:wastePending"), type: "kpi:wastePending", span: 4 },
  { id: makeWidgetId("kpi:varianceFlags"), type: "kpi:varianceFlags", span: 4 },
  { id: makeWidgetId("widget:utilityTrend"), type: "widget:utilityTrend", span: 8 },
  { id: makeWidgetId("widget:alerts"), type: "widget:alerts", span: 4 },
  { id: makeWidgetId("widget:auditCalendar"), type: "widget:auditCalendar", span: 4 },
  { id: makeWidgetId("widget:factoryPerformance"), type: "widget:factoryPerformance", span: 12 },
  { id: makeWidgetId("widget:overdueActions"), type: "widget:overdueActions", span: 4 },
  { id: makeWidgetId("widget:recentUploads"), type: "widget:recentUploads", span: 4 },
  { id: makeWidgetId("widget:expiringDocs"), type: "widget:expiringDocs", span: 4 },
];

export const DEFAULT_WIDGETS_BY_ID: DashboardBuilderState["widgetsById"] = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
);

export const DEFAULT_CONTAINERS: DashboardContainer[] = [
  {
    id: "c_kpis",
    title: "KPIs",
    widgetIds: WIDGETS.filter((w) => w.type.startsWith("kpi:")).map((w) => w.id),
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
  },
  {
    id: "c_actions",
    title: "Actions",
    widgetIds: [
      makeWidgetId("widget:overdueActions"),
      makeWidgetId("widget:recentUploads"),
      makeWidgetId("widget:expiringDocs"),
    ],
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

export function arrayMove<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  if (it === undefined) return arr;
  next.splice(to, 0, it);
  return next;
}

