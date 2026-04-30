import {
  CalendarDays, ClipboardList, Droplets, FileText, Gauge, LayoutDashboard,
  Leaf, LineChart, MessageSquareWarning, Settings, ShieldCheck, Sparkles,
  TriangleAlert, UsersRound,
} from "lucide-react";

import type { AppRouteDef } from "@/core/routes/route.types";

export const appRouteDefs: AppRouteDef[] = [
  { path: "dashboard", segment: "dashboard", label: "Dashboard", group: "Overview", permission: "dashboard:read", icon: LayoutDashboard, exportName: "DashboardPage", load: () => import("@/features/DashboardPage") },
  { path: "audit-calendar", segment: "audit-calendar", label: "Audit calendar", group: "Overview", permission: "audit-calendar:read", icon: CalendarDays, exportName: "AuditCalendarPage", load: () => import("@/features/AuditCalendarPage") },
  { path: "companies/:id", segment: "companies", label: "Companies", exportName: "FacilityDashboardPage", load: () => import("@/features/FacilityDashboardPage") },
  { path: "facilities/:id", segment: "facilities", label: "Companies", exportName: "FacilityDashboardPage", load: () => import("@/features/FacilityDashboardPage") },
  { path: "utilities", segment: "utilities", label: "Utilities", group: "Operations", permission: "utilities:read", icon: Gauge, exportName: "UtilitiesPage", load: () => import("@/features/UtilitiesPage") },
  { path: "chemicals", segment: "chemicals", label: "Chemicals", group: "Operations", permission: "chemicals:read", icon: Leaf, exportName: "ChemicalsPage", load: () => import("@/features/ChemicalsPage") },
  { path: "sds", segment: "sds", label: "SDS", group: "Operations", permission: "sds:read", icon: FileText, exportName: "SdsPage", load: () => import("@/features/SdsPage") },
  { path: "waste", segment: "waste", label: "Waste", group: "Operations", permission: "waste:read", icon: Sparkles, exportName: "WastePage", load: () => import("@/features/WastePage") },
  { path: "wastewater", segment: "wastewater", label: "Wastewater / ETP", group: "Operations", permission: "wastewater:read", icon: Droplets, exportName: "WastewaterPage", load: () => import("@/features/WastewaterPage") },
  { path: "audits", segment: "audits", label: "Audits", group: "Assurance", permission: "audits:read", icon: ShieldCheck, exportName: "AuditsPage", load: () => import("@/features/AuditsPage") },
  { path: "capa", segment: "capa", label: "CAPA", group: "Assurance", permission: "capa:read", icon: ClipboardList, exportName: "CapaPage", load: () => import("@/features/CapaPage") },
  { path: "reports", segment: "reports", label: "Reports", group: "Assurance", permission: "reports:read", icon: LineChart, exportName: "ReportsPage", load: () => import("@/core/ReportsPage") },
  { path: "documents", segment: "documents", label: "Documents", group: "Assurance", permission: "documents:read", icon: FileText, exportName: "DocumentsPage", load: () => import("@/features/DocumentsPage") },
  { path: "complaint-box", segment: "complaint-box", label: "Complaint box", group: "People", permission: "complaints:read", icon: MessageSquareWarning, exportName: "ComplaintBoxPage", load: () => import("@/features/ComplaintBoxPage") },
  { path: "incidents", segment: "incidents", label: "Incidents", group: "People", permission: "incidents:read", icon: TriangleAlert, exportName: "IncidentsPage", load: () => import("@/features/IncidentsPage") },
  { path: "training", segment: "training", label: "Training", group: "People", permission: "training:read", icon: UsersRound, exportName: "TrainingPage", load: () => import("@/features/TrainingPage") },
  { path: "notifications", segment: "notifications", label: "Notifications", group: "People", permission: "notifications:read", icon: TriangleAlert, exportName: "NotificationsPage", load: () => import("@/features/NotificationsPage") },
  { path: "settings", segment: "settings", label: "Settings", group: "Admin", permission: "settings:read", icon: Settings },
];
