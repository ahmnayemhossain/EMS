import {
  BellRing, ClipboardList, Droplet, FileWarning, ShieldCheck, TrendingUp,
} from "lucide-react";

import type { ActivityItem } from "@/components/layout/primitives/ActivityList";
import type { TimelineItem } from "@/components/layout/primitives/TimelineList";
import {
  audits, capas, chemicals, documents, facilities, notifications, utilityRecords,
} from "@/core/data/catalog/mock";
import { formatDate } from "@/core/utils/format";

import type { DashboardKpi } from "../components/DashboardKpis";

export function buildDashboardData() {
  const avgReadiness = Math.round(facilities.reduce((sum, facility) => sum + facility.auditReadinessScore, 0) / facilities.length);
  const openCapa = capas.filter((item) => item.status !== "closed").length;
  const expiredDocs = documents.filter((item) => item.status === "expired").length;
  const chemicalAlerts = chemicals.filter((item) => item.approvalStatus !== "approved").length;
  const varianceFlags = utilityRecords.filter((item) => item.varianceFlag === "high").length;
  const utilityTrend = Array.from(utilityRecords.filter((item) => item.type === "electricity").reduce((map, item) => map.set(item.periodStart.slice(0, 7), (map.get(item.periodStart.slice(0, 7)) ?? 0) + item.value), new Map<string, number>()), ([month, kwh]) => ({ month, kwh })).sort((a, b) => a.month.localeCompare(b.month));
  const kpis: DashboardKpi[] = [{ key: "readiness", title: "Audit readiness score", value: `${avgReadiness}%`, helper: "Weighted across active companies", tone: avgReadiness >= 85 ? "compliant" : avgReadiness >= 70 ? "warning" : "critical", icon: ShieldCheck }, { key: "openCapa", title: "Open CAPA", value: openCapa, helper: "All statuses except closed", tone: openCapa > 0 ? "warning" : "compliant", icon: ClipboardList }, { key: "expiredDocs", title: "Expired documents", value: expiredDocs, helper: "Requires renewal / upload", tone: expiredDocs > 0 ? "critical" : "compliant", icon: FileWarning }, { key: "chemicalAlerts", title: "Chemical alerts", value: chemicalAlerts, helper: "Restricted or pending approvals", tone: chemicalAlerts > 0 ? "warning" : "compliant", icon: BellRing }, { key: "wastePending", title: "Waste disposal pending", value: 3, helper: "Stored / scheduled streams", tone: "warning", icon: Droplet }, { key: "varianceFlags", title: "Utility variance flags", value: varianceFlags, helper: "High variance vs baseline", tone: varianceFlags > 0 ? "info" : "compliant", icon: TrendingUp }];
  const overdueActions: TimelineItem[] = capas.filter((item) => item.status === "overdue").map((item) => ({ id: item.id, title: item.title, date: `Due ${formatDate(item.dueDate)}`, description: `${item.owner} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Evidence: ${item.evidenceCount}`, tone: "critical" }));
  const recentUploads: ActivityItem[] = [{ id: "up_001", title: "ETP Lab Report uploaded (GS-D)", time: "2026-04-04 10:12", tone: "info", meta: "ETP Monitoring", type: "upload" }, { id: "up_002", title: "Electricity bill attached (GS-A)", time: "2026-04-02 16:40", tone: "compliant", meta: "Utilities", type: "document" }, { id: "up_003", title: "Waste manifest uploaded (GS-A)", time: "2026-04-01 14:20", tone: "compliant", meta: "Waste disposal", type: "upload" }];
  return { kpis, utilityTrend, notifications, audits, overdueActions, recentUploads, expiringDocuments: documents.filter((item) => item.status !== "valid"), facilities };
}

