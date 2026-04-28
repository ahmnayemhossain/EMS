export type DashboardKpiKey =
  | "readiness"
  | "openCapa"
  | "expiredDocs"
  | "chemicalAlerts"
  | "wastePending"
  | "varianceFlags";

export type DashboardSectionKey =
  | "kpis"
  | "topWidgets"
  | "companyPerformance"
  | "bottomWidgets";

export type DashboardTopWidgetKey = "utilityTrend" | "alerts" | "calendar";

export type DashboardBottomWidgetKey =
  | "overdueActions"
  | "recentUploads"
  | "expiringDocuments";

export type DashboardSpanMap<K extends string> = Record<K, number>;

