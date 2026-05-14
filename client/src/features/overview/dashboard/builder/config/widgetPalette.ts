import type { DashboardWidgetType } from "@/core/app/state/slices/dashboard-builder.types";

export type WidgetPaletteItem = {
  type: DashboardWidgetType;
  label: string;
  defaultSpan: number;
};

export const WIDGET_PALETTE: WidgetPaletteItem[] = [
  { type: "kpi:readiness", label: "KPI • Readiness", defaultSpan: 4 },
  { type: "kpi:openCapa", label: "KPI • Open CAPA", defaultSpan: 4 },
  { type: "kpi:expiredDocs", label: "KPI • Expired docs", defaultSpan: 4 },
  { type: "kpi:chemicalAlerts", label: "KPI • Chemical alerts", defaultSpan: 4 },
  { type: "kpi:wastePending", label: "KPI • Waste pending", defaultSpan: 4 },
  { type: "kpi:varianceFlags", label: "KPI • Variance flags", defaultSpan: 4 },
  { type: "widget:utilityTrend", label: "Chart • Utility trend", defaultSpan: 8 },
  { type: "widget:alerts", label: "Card • Compliance alerts", defaultSpan: 4 },
  { type: "widget:auditCalendar", label: "Card • Audit calendar", defaultSpan: 4 },
  { type: "widget:companyPerformance", label: "Table • Company performance", defaultSpan: 12 },
  { type: "widget:overdueActions", label: "List • Overdue actions", defaultSpan: 4 },
  { type: "widget:recentUploads", label: "List • Recent uploads", defaultSpan: 4 },
  { type: "widget:expiringDocs", label: "Card • Expiring documents", defaultSpan: 4 },
];
