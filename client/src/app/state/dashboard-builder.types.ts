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
  | "widget:companyPerformance";

export type DashboardWidget = {
  id: string;
  type: DashboardWidgetType;
  span: number; // 1..12
  rows?: number; // grid rows (1..N)
};

export type DashboardGridRect = {
  x: number; // 1..12 (css grid line start)
  y: number; // 1..N
  w: number; // 1..12
  h: number; // 1..N
};

export type DashboardContainer = {
  id: string;
  title: string;
  collapsed?: boolean;
  widgetIds: string[];
  layout?: DashboardGridRect;
};

export type DashboardBuilderState = {
  containers: DashboardContainer[];
  widgetsById: Record<string, DashboardWidget>;
};

export type DashboardWidgetLocation = {
  containerId: string;
  index: number;
};
