import { CompanyPerformanceCard } from "../components/CompanyPerformanceCard";
import { DashboardBottomWidgets } from "../components/DashboardBottomWidgets";
import { DashboardKpis } from "../components/DashboardKpis";
import { DashboardTopWidgets } from "../components/DashboardTopWidgets";
import { buildDashboardData } from "./data";

export function buildDashboardSections(enabled: boolean) {
  const data = buildDashboardData();
  return {
    kpis: <DashboardKpis items={data.kpis} rearrangeEnabled={enabled} />,
    topWidgets: <DashboardTopWidgets utilityTrend={data.utilityTrend} notifications={data.notifications} audits={data.audits} rearrangeEnabled={enabled} />,
    companyPerformance: <CompanyPerformanceCard facilities={data.facilities} />,
    bottomWidgets: <DashboardBottomWidgets overdueActions={data.overdueActions} recentUploads={data.recentUploads} expiringDocuments={data.expiringDocuments} rearrangeEnabled={enabled} />,
  } as const;
}
