import * as React from "react";
import { FileText, ShieldCheck } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useDashboardLayout, type DashboardSectionKey } from "@/app/state/dashboard-layout";
import type { ActivityItem } from "@/components/ActivityList";
import { PageHeader } from "@/components/PageHeader";
import type { StatusTone } from "@/components/StatusBadge";
import type { TimelineItem } from "@/components/TimelineList";
import {
  audits,
  capas,
  chemicals,
  documents,
  facilities,
  notifications,
  utilityRecords,
} from "@/data/mock";
import { formatDate } from "@/utils/format";

import { DashboardBottomWidgets } from "./components/DashboardBottomWidgets";
import { DashboardKpis, type DashboardKpi } from "./components/DashboardKpis";
import { DashboardSectionItem } from "./components/DashboardSectionItem";
import { DashboardTopWidgets } from "./components/DashboardTopWidgets";
import type { UtilityTrendPoint } from "./components/UtilityTrendCard";
import { FactoryPerformanceCard } from "./components/FactoryPerformanceCard";

const utilityTrend: UtilityTrendPoint[] = [
  { month: "Nov", kwh: 780_000 },
  { month: "Dec", kwh: 812_000 },
  { month: "Jan", kwh: 835_000 },
  { month: "Feb", kwh: 805_000 },
  { month: "Mar", kwh: 820_000 },
  { month: "Apr", kwh: 790_000 },
];

export function DashboardPage() {
  const isMobile = useIsMobile();
  const [rearrange, setRearrange] = React.useState(false);
  const { sectionOrder, moveSection, reset } = useDashboardLayout();

  const avgReadiness = Math.round(
    facilities.reduce((sum, f) => sum + f.auditReadinessScore, 0) / facilities.length,
  );
  const openCapa = capas.filter((c) => c.status !== "closed").length;
  const expiredDocs = documents.filter((d) => d.status === "expired").length;
  const chemicalAlerts = chemicals.filter((c) => c.approvalStatus !== "approved").length;
  const wasteDisposalPending = 3;
  const varianceFlags = utilityRecords.filter((r) => r.varianceFlag === "high").length;

  const readinessTone: StatusTone =
    avgReadiness >= 85 ? "compliant" : avgReadiness >= 70 ? "warning" : "critical";

  const kpis: DashboardKpi[] = [
    {
      key: "readiness",
      title: "Audit Readiness Score",
      value: `${avgReadiness}%`,
      helper: "Weighted across active factories",
      icon: ShieldCheck,
      tone: readinessTone,
    },
    { key: "openCapa", title: "Open CAPA", value: openCapa, helper: "All statuses except closed", tone: openCapa > 0 ? "warning" : "compliant" },
    { key: "expiredDocs", title: "Expired Documents", value: expiredDocs, helper: "Requires renewal / upload", tone: expiredDocs > 0 ? "critical" : "compliant" },
    { key: "chemicalAlerts", title: "Chemical Alerts", value: chemicalAlerts, helper: "Restricted or pending approvals", tone: chemicalAlerts > 0 ? "warning" : "compliant" },
    { key: "wastePending", title: "Waste Disposal Pending", value: wasteDisposalPending, helper: "Stored / scheduled streams", tone: wasteDisposalPending > 0 ? "warning" : "compliant" },
    { key: "varianceFlags", title: "Utility Variance Flags", value: varianceFlags, helper: "High variance vs baseline", tone: varianceFlags > 0 ? "info" : "compliant" },
  ];

  const overdueActions: TimelineItem[] = capas
    .filter((c) => c.status === "overdue")
    .map((c) => ({
      id: c.id,
      title: c.title,
      date: `Due ${formatDate(c.dueDate)}`,
      description: `${c.owner} • Evidence: ${c.evidenceCount}`,
      tone: "critical",
    }));

  const recentUploads: ActivityItem[] = [
    { id: "up_001", title: "ETP Lab Report uploaded (GS-D)", time: "2026-04-04 10:12", tone: "info", meta: "ETP Monitoring", type: "upload" },
    { id: "up_002", title: "Electricity bill attached (GS-A)", time: "2026-04-02 16:40", tone: "compliant", meta: "Utilities", type: "document" },
    { id: "up_003", title: "Waste manifest uploaded (GS-A)", time: "2026-04-01 14:20", tone: "compliant", meta: "Waste disposal", type: "upload" },
  ];

  const expiringDocuments = documents.filter((d) => d.status !== "valid");
  const rearrangeEnabled = !isMobile && rearrange;

  const sectionsByKey: Record<DashboardSectionKey, React.ReactNode> = {
    kpis: <DashboardKpis items={kpis} rearrangeEnabled={rearrangeEnabled} />,
    topWidgets: (
      <DashboardTopWidgets
        utilityTrend={utilityTrend}
        notifications={notifications}
        audits={audits}
        rearrangeEnabled={rearrangeEnabled}
      />
    ),
    factoryPerformance: <FactoryPerformanceCard facilities={facilities} />,
    bottomWidgets: (
      <DashboardBottomWidgets
        overdueActions={overdueActions}
        recentUploads={recentUploads}
        expiringDocuments={expiringDocuments}
        rearrangeEnabled={rearrangeEnabled}
      />
    ),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group dashboard"
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isMobile ? (
              <>
                <Button type="button" variant={rearrange ? "default" : "outline"} size="sm" onClick={() => setRearrange((v) => !v)}>
                  {rearrange ? "Done" : "Rearrange"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { reset(); setRearrange(false); }}>
                  Reset layout
                </Button>
              </>
            ) : null}
            <Button variant="outline" size="sm">
              <FileText className="mr-2 size-4" />
              Generate report
            </Button>
          </div>
        }
      />

      {sectionOrder.map((key) => (
        <DashboardSectionItem
          key={key}
          id={key}
          enabled={rearrangeEnabled}
          onMove={moveSection}
        >
          {sectionsByKey[key]}
        </DashboardSectionItem>
      ))}
    </div>
  );
}
