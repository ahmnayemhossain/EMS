import * as React from "react";
import {
  BellRing,
  ClipboardList,
  Droplet,
  FileWarning,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useDashboardLayout } from "@/app/state/dashboard-layout";
import { PageHeader } from "@/components/PageHeader";
import type { ActivityItem } from "@/components/ActivityList";
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

import type { DashboardKpi } from "./components/DashboardKpis";
import { DashboardKpis } from "./components/DashboardKpis";
import { DashboardSectionItem } from "./components/DashboardSectionItem";
import { DashboardTopWidgets } from "./components/DashboardTopWidgets";
import { DashboardBottomWidgets } from "./components/DashboardBottomWidgets";
import { FactoryPerformanceCard } from "./components/FactoryPerformanceCard";

export function DashboardPage() {
  const isMobile = useIsMobile();
  const [customize, setCustomize] = React.useState(false);
  const { sectionOrder, moveSection, reset: resetLayout } = useDashboardLayout();
  const enabled = Boolean(customize) && !isMobile;

  const avgReadiness = Math.round(
    facilities.reduce((sum, f) => sum + f.auditReadinessScore, 0) / facilities.length,
  );
  const openCapa = capas.filter((c) => c.status !== "closed").length;
  const expiredDocs = documents.filter((d) => d.status === "expired").length;
  const chemicalAlerts = chemicals.filter((c) => c.approvalStatus !== "approved").length;
  const wasteDisposalPending = 3;
  const varianceFlags = utilityRecords.filter((r) => r.varianceFlag === "high").length;
  const utilityTrend = React.useMemo(() => {
    const totalsByMonth = new Map<string, number>();

    for (const record of utilityRecords) {
      if (record.type !== "electricity") continue;
      const month = record.periodStart.slice(0, 7);
      totalsByMonth.set(month, (totalsByMonth.get(month) ?? 0) + record.value);
    }

    return Array.from(totalsByMonth, ([month, kwh]) => ({ month, kwh })).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }, []);

  const kpis: DashboardKpi[] = [
    {
      key: "readiness",
      title: "Audit readiness score",
      value: `${avgReadiness}%`,
      helper: "Weighted across active factories",
      tone: avgReadiness >= 85 ? "compliant" : avgReadiness >= 70 ? "warning" : "critical",
      icon: ShieldCheck,
    },
    {
      key: "openCapa",
      title: "Open CAPA",
      value: openCapa,
      helper: "All statuses except closed",
      tone: openCapa > 0 ? "warning" : "compliant",
      icon: ClipboardList,
    },
    {
      key: "expiredDocs",
      title: "Expired documents",
      value: expiredDocs,
      helper: "Requires renewal / upload",
      tone: expiredDocs > 0 ? "critical" : "compliant",
      icon: FileWarning,
    },
    {
      key: "chemicalAlerts",
      title: "Chemical alerts",
      value: chemicalAlerts,
      helper: "Restricted or pending approvals",
      tone: chemicalAlerts > 0 ? "warning" : "compliant",
      icon: BellRing,
    },
    {
      key: "wastePending",
      title: "Waste disposal pending",
      value: wasteDisposalPending,
      helper: "Stored / scheduled streams",
      tone: wasteDisposalPending > 0 ? "warning" : "compliant",
      icon: Droplet,
    },
    {
      key: "varianceFlags",
      title: "Utility variance flags",
      value: varianceFlags,
      helper: "High variance vs baseline",
      tone: varianceFlags > 0 ? "info" : "compliant",
      icon: TrendingUp,
    },
  ];

  const overdueActions: TimelineItem[] = capas
    .filter((c) => c.status === "overdue")
    .map((c) => ({
      id: c.id,
      title: c.title,
      date: `Due ${formatDate(c.dueDate)}`,
      description: `${c.owner} \u2022 Evidence: ${c.evidenceCount}`,
      tone: "critical",
    }));

  const recentUploads: ActivityItem[] = [
    {
      id: "up_001",
      title: "ETP Lab Report uploaded (GS-D)",
      time: "2026-04-04 10:12",
      tone: "info",
      meta: "ETP Monitoring",
      type: "upload",
    },
    {
      id: "up_002",
      title: "Electricity bill attached (GS-A)",
      time: "2026-04-02 16:40",
      tone: "compliant",
      meta: "Utilities",
      type: "document",
    },
    {
      id: "up_003",
      title: "Waste manifest uploaded (GS-A)",
      time: "2026-04-01 14:20",
      tone: "compliant",
      meta: "Waste disposal",
      type: "upload",
    },
  ];

  const expiringDocuments = documents.filter((d) => d.status !== "valid");

  const sectionsByKey = {
    kpis: <DashboardKpis items={kpis} rearrangeEnabled={enabled} />,
    topWidgets: (
      <DashboardTopWidgets
        utilityTrend={utilityTrend}
        notifications={notifications}
        audits={audits}
        rearrangeEnabled={enabled}
      />
    ),
    factoryPerformance: <FactoryPerformanceCard facilities={facilities} />,
    bottomWidgets: (
      <DashboardBottomWidgets
        overdueActions={overdueActions}
        recentUploads={recentUploads}
        expiringDocuments={expiringDocuments}
        rearrangeEnabled={enabled}
      />
    ),
  } as const;

  return (
    <div className="aws-dashboard-grid space-y-6 py-2">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
              <span className="text-muted-foreground text-xs">Customize</span>
              <Switch checked={customize} onCheckedChange={setCustomize} disabled={isMobile} />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetLayout();
                setCustomize(false);
              }}
            >
              Reset layout
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {sectionOrder.map((key, idx) => (
          <DashboardSectionItem
            key={key}
            id={key}
            index={idx}
            enabled={enabled}
            onMove={moveSection}
          >
            {sectionsByKey[key]}
          </DashboardSectionItem>
        ))}
      </div>
    </div>
  );
}
