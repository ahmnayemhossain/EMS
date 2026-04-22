import * as React from "react";

import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useDashboardBuilder } from "@/app/state/dashboard-builder";
import { PageHeader } from "@/components/PageHeader";
import type { ActivityItem } from "@/components/ActivityList";
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

import { DashboardBuilder } from "./builder/DashboardBuilder";
import { DashboardLayoutContextMenu } from "./builder/DashboardLayoutContextMenu";
import type { DashboardWidgetData } from "./builder/widgetRegistry";
import type { UtilityTrendPoint } from "./components/UtilityTrendCard";

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
  const [editMode, setEditMode] = React.useState(false);
  const { reset, addContainer } = useDashboardBuilder();

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

  const kpis: DashboardWidgetData["kpis"] = [
    {
      key: "readiness",
      title: "Audit Readiness Score",
      value: `${avgReadiness}%`,
      helper: "Weighted across active factories",
      tone: readinessTone,
    },
    {
      key: "openCapa",
      title: "Open CAPA",
      value: openCapa,
      helper: "All statuses except closed",
      tone: openCapa > 0 ? "warning" : "compliant",
    },
    {
      key: "expiredDocs",
      title: "Expired Documents",
      value: expiredDocs,
      helper: "Requires renewal / upload",
      tone: expiredDocs > 0 ? "critical" : "compliant",
    },
    {
      key: "chemicalAlerts",
      title: "Chemical Alerts",
      value: chemicalAlerts,
      helper: "Restricted or pending approvals",
      tone: chemicalAlerts > 0 ? "warning" : "compliant",
    },
    {
      key: "wastePending",
      title: "Waste Disposal Pending",
      value: wasteDisposalPending,
      helper: "Stored / scheduled streams",
      tone: wasteDisposalPending > 0 ? "warning" : "compliant",
    },
    {
      key: "varianceFlags",
      title: "Utility Variance Flags",
      value: varianceFlags,
      helper: "High variance vs baseline",
      tone: varianceFlags > 0 ? "info" : "compliant",
    },
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
  const enabled = Boolean(editMode) && !isMobile;

  return (
    <DashboardLayoutContextMenu
      editMode={editMode}
      onEditModeChange={(next) => setEditMode(next && !isMobile)}
      disableEdit={isMobile}
      onAddContainer={() => addContainer("Container")}
      onReset={() => {
        reset();
        setEditMode(false);
      }}
    >
      <div className="aws-dashboard-grid space-y-6 py-2">
        <PageHeader
          title={
            <span className="grid gap-1">
              <span className="flex items-center gap-2">
                <span>Dashboard</span>
                {enabled ? (
                  <span className="bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
                    Edit mode
                  </span>
                ) : null}
              </span>
              <span className="text-muted-foreground text-xs">
                Desktop: right-click to customize layout
              </span>
            </span>
          }
        />

        <DashboardBuilder
          enabled={enabled}
          data={{
            kpis,
            utilityTrend,
            notifications,
            audits,
            overdueActions,
            recentUploads,
            expiringDocuments,
            facilities,
          }}
        />
      </div>
    </DashboardLayoutContextMenu>
  );
}

