export type DashboardWidgetType =
  | "kpi:readiness"
  | "kpi:openCapa"
  | "kpi:expiredDocs"
  | "kpi:chemicalAlerts"
  | "kpi:wastePending"
  | "kpi:varianceFlags"
  | "widget:utilityTrend"
  | "widget:alerts"
  | "widget:auditCalendar"
  | "widget:overdueActions"
  | "widget:recentUploads"
  | "widget:expiringDocs"
  | "widget:factoryPerformance";

export type DashboardWidget = {
  id: string;
  type: DashboardWidgetType;
  span: number; // 1..12
};

export type DashboardContainer = {
  id: string;
  title: string;
  collapsed?: boolean;
  widgetIds: string[];
};

export type DashboardBuilderState = {
  containers: DashboardContainer[];
  widgetsById: Record<string, DashboardWidget>;
};

export type DashboardWidgetLocation = {
  containerId: string;
  index: number;
};

