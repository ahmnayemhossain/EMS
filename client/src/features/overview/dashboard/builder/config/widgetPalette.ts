import type { DashboardWidgetType } from "@/core/app/state/slices/dashboard-builder.types";

export type WidgetPaletteItem = {
  type: DashboardWidgetType;
  label: string;
  defaultSpan: number;
};

export const WIDGET_PALETTE: WidgetPaletteItem[] = [
  { type: "kpi:readiness", label: "KPI â€¢ Readiness", defaultSpan: 4 },
  { type: "kpi:openCapa", label: "KPI â€¢ Open CAPA", defaultSpan: 4 },
  { type: "kpi:expiredDocs", label: "KPI â€¢ Expired docs", defaultSpan: 4 },
  { type: "kpi:chemicalAlerts", label: "KPI â€¢ Chemical alerts", defaultSpan: 4 },
  { type: "kpi:wastePending", label: "KPI â€¢ Waste pending", defaultSpan: 4 },
  { type: "kpi:varianceFlags", label: "KPI â€¢ Variance flags", defaultSpan: 4 },
  { type: "widget:utilityTrend", label: "Chart â€¢ Utility trend", defaultSpan: 8 },
  { type: "widget:alerts", label: "Card â€¢ Compliance alerts", defaultSpan: 4 },
  { type: "widget:auditCalendar", label: "Card â€¢ Audit calendar", defaultSpan: 4 },
  { type: "widget:companyPerformance", label: "Table â€¢ Company performance", defaultSpan: 12 },
  { type: "widget:overdueActions", label: "List â€¢ Overdue actions", defaultSpan: 4 },
  { type: "widget:recentUploads", label: "List â€¢ Recent uploads", defaultSpan: 4 },
  { type: "widget:expiringDocs", label: "Card â€¢ Expiring documents", defaultSpan: 4 },
];

