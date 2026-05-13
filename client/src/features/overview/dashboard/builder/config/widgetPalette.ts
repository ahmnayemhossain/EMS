import type { DashboardWidgetType } from "@/core/app/state/slices/dashboard-builder.types";

export type WidgetPaletteItem = {
  type: DashboardWidgetType;
  label: string;
  defaultSpan: number;
};

export const WIDGET_PALETTE: WidgetPaletteItem[] = [
  { type: "kpi:readiness", label: "KPI ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Readiness", defaultSpan: 4 },
  { type: "kpi:openCapa", label: "KPI ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Open CAPA", defaultSpan: 4 },
  { type: "kpi:expiredDocs", label: "KPI ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Expired docs", defaultSpan: 4 },
  { type: "kpi:chemicalAlerts", label: "KPI ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Chemical alerts", defaultSpan: 4 },
  { type: "kpi:wastePending", label: "KPI ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Waste pending", defaultSpan: 4 },
  { type: "kpi:varianceFlags", label: "KPI ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Variance flags", defaultSpan: 4 },
  { type: "widget:utilityTrend", label: "Chart ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Utility trend", defaultSpan: 8 },
  { type: "widget:alerts", label: "Card ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Compliance alerts", defaultSpan: 4 },
  { type: "widget:auditCalendar", label: "Card ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Audit calendar", defaultSpan: 4 },
  { type: "widget:companyPerformance", label: "Table ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Company performance", defaultSpan: 12 },
  { type: "widget:overdueActions", label: "List ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Overdue actions", defaultSpan: 4 },
  { type: "widget:recentUploads", label: "List ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Recent uploads", defaultSpan: 4 },
  { type: "widget:expiringDocs", label: "Card ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Expiring documents", defaultSpan: 4 },
];

