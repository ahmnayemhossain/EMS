import * as React from "react";
import {
  AlertTriangle,
  CalendarDays,
  FileText,
  Flag,
  ShieldCheck,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import type { ActivityItem } from "@/components/layout/primitives/ActivityList";
import { ActivityList } from "@/components/layout/primitives/ActivityList";
import { TimelineList, type TimelineItem } from "@/components/layout/primitives/TimelineList";
import type { StatusTone } from "@/components/feedback/StatusBadge";
import type { Audit, Document, Facility, Notification } from "@/core/types/models/ems";

import { AuditCalendarCard } from "../../components/AuditCalendarCard";
import { ComplianceAlertsCard } from "../../components/ComplianceAlertsCard";
import { ExpiringDocsCard } from "../../components/ExpiringDocsCard";
import { CompanyPerformanceCard } from "../../components/CompanyPerformanceCard";
import { UtilityTrendCard, type UtilityTrendPoint } from "../../components/UtilityTrendCard";

import type { DashboardWidgetType } from "@/core/app/state/slices/dashboard-builder.types";

export type DashboardWidgetData = {
  kpis: Array<{
    key:
      | "readiness"
      | "openCapa"
      | "expiredDocs"
      | "chemicalAlerts"
      | "wastePending"
      | "varianceFlags";
    title: string;
    value: React.ReactNode;
    helper?: React.ReactNode;
    tone?: StatusTone;
  }>;
  utilityTrend: UtilityTrendPoint[];
  notifications: Notification[];
  audits: Audit[];
  overdueActions: TimelineItem[];
  recentUploads: ActivityItem[];
  expiringDocuments: Document[];
  facilities: Facility[];
};

function kpiKeyFromType(type: DashboardWidgetType) {
  if (type === "kpi:readiness") return "readiness";
  if (type === "kpi:openCapa") return "openCapa";
  if (type === "kpi:expiredDocs") return "expiredDocs";
  if (type === "kpi:chemicalAlerts") return "chemicalAlerts";
  if (type === "kpi:wastePending") return "wastePending";
  if (type === "kpi:varianceFlags") return "varianceFlags";
  return null;
}

function iconForKpiKey(
  key: DashboardWidgetData["kpis"][number]["key"],
): LucideIcon {
  if (key === "readiness") return ShieldCheck;
  if (key === "openCapa") return ClipboardCheck;
  if (key === "expiredDocs") return FileText;
  if (key === "chemicalAlerts") return AlertTriangle;
  if (key === "wastePending") return CalendarDays;
  return Flag;
}

export function renderDashboardWidget(type: DashboardWidgetType, data: DashboardWidgetData) {
  const kpiKey = kpiKeyFromType(type);
  if (kpiKey) {
    const item = data.kpis.find((k) => k.key === kpiKey);
    if (!item) return null;
    return <KPIStatCard {...item} icon={iconForKpiKey(item.key)} />;
  }

  if (type === "widget:utilityTrend") return <UtilityTrendCard points={data.utilityTrend} />;
  if (type === "widget:alerts") return <ComplianceAlertsCard items={data.notifications.slice(0, 3)} />;
  if (type === "widget:auditCalendar") {
    const selectedDate = new Date(data.audits[0]?.date ?? Date.now());
    return <AuditCalendarCard selectedDate={selectedDate} />;
  }
  if (type === "widget:companyPerformance") return <CompanyPerformanceCard facilities={data.facilities} />;
  if (type === "widget:overdueActions") return <TimelineList title="Overdue actions" items={data.overdueActions} />;
  if (type === "widget:recentUploads") return <ActivityList title="Recent uploads" items={data.recentUploads} />;
  if (type === "widget:expiringDocs") return <ExpiringDocsCard documents={data.expiringDocuments} />;

  return null;
}

