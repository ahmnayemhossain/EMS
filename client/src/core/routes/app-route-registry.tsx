import {
  CalendarDays, ClipboardList, Droplets, FileText, Gauge,
  Leaf, LineChart, Settings, ShieldCheck, Sparkles,
  TriangleAlert, UsersRound,
} from "lucide-react";

import type { AppRouteDef } from "@/core/routes/route.types";

export const appRouteDefs: AppRouteDef[] = [
  { path: "audit-calendar", segment: "audit-calendar", label: "Audit calendar", group: "Overview", permission: "audit-calendar:read", icon: CalendarDays, exportName: "AuditCalendarPage", load: () => import("@/features/overview/audit-calendar/pages/index") },
  { path: "utilities", segment: "utilities", label: "Utilities", group: "Operations", permission: "utilities:read", icon: Gauge, exportName: "UtilitiesPage", load: () => import("@/features/operations/utilities/pages/UtilitiesPage") },
  { path: "chemicals", segment: "chemicals", label: "Chemicals", group: "Operations", permission: "chemicals:read", icon: Leaf, exportName: "ChemicalsPage", load: () => import("@/features/operations/chemicals/pages/index") },
  { path: "sds", segment: "sds", label: "SDS", group: "Operations", permission: "sds:read", icon: FileText, exportName: "SdsPage", load: () => import("@/features/operations/sds/pages/index") },
  { path: "waste", segment: "waste", label: "Waste", group: "Operations", permission: "waste:read", icon: Sparkles, exportName: "WastePage", load: () => import("@/features/operations/waste/pages/index") },
  { path: "wastewater", segment: "wastewater", label: "Wastewater / ETP", group: "Operations", permission: "wastewater:read", icon: Droplets, exportName: "WastewaterPage", load: () => import("@/features/operations/wastewater/pages/index") },
  { path: "audits", segment: "audits", label: "Audits", group: "Assurance", permission: "audits:read", icon: ShieldCheck, exportName: "AuditsPage", load: () => import("@/features/assurance/audits/pages/index") },
  { path: "capa", segment: "capa", label: "CAPA", group: "Assurance", permission: "capa:read", icon: ClipboardList, exportName: "CapaPage", load: () => import("@/features/assurance/capa/pages/index") },
  { path: "reports", segment: "reports", label: "Reports", group: "Assurance", permission: "reports:read", icon: LineChart, exportName: "ReportsPage", load: () => import("@/features/assurance/reports/pages/index") },
  { path: "documents", segment: "documents", label: "Documents", group: "Assurance", permission: "documents:read", icon: FileText, exportName: "DocumentsPage", load: () => import("@/features/assurance/documents/index") },
  { path: "incidents", segment: "incidents", label: "Incidents", group: "People", permission: "incidents:read", icon: TriangleAlert, exportName: "IncidentsPage", load: () => import("@/features/people/incidents/pages/index") },
  { path: "training", segment: "training", label: "Training", group: "People", permission: "training:read", icon: UsersRound, exportName: "TrainingPage", load: () => import("@/features/people/training") },
  { path: "settings", segment: "settings", label: "Settings", group: "Admin", permission: "settings:read", icon: Settings },
];
