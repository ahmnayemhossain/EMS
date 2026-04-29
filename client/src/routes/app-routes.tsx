import { Navigate } from "react-router";

import { AuditCalendarPage } from "@/pages/AuditCalendarPage";
import { AuditsPage } from "@/pages/AuditsPage";
import { CapaPage } from "@/pages/CapaPage";
import { ChemicalsPage } from "@/pages/ChemicalsPage";
import { ComplaintBoxPage } from "@/pages/ComplaintBoxPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { FacilityDashboardPage } from "@/pages/FacilityDashboardPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { SdsPage } from "@/pages/SdsPage";
import { TrainingPage } from "@/pages/TrainingPage";
import { UtilitiesPage } from "@/pages/UtilitiesPage";
import { WastePage } from "@/pages/WastePage";
import { WastewaterPage } from "@/pages/WastewaterPage";
import { AppShell } from "@/layouts/AppShell";

import { ProtectedAppShell } from "@/routes/protected-shell";
import { settingsRoute } from "@/routes/settings-routes";

export const appRoutes = [{
  path: "/",
  element: <ProtectedAppShell />,
  errorElement: <RouteErrorPage />,
  children: [
    { index: true, element: <Navigate to="/dashboard" replace /> },
    { path: "index.html", element: <Navigate to="/dashboard" replace /> },
    { path: "dashboard", element: <DashboardPage /> },
    { path: "audit-calendar", element: <AuditCalendarPage /> },
    { path: "companies/:id", element: <FacilityDashboardPage /> },
    { path: "facilities/:id", element: <FacilityDashboardPage /> },
    { path: "utilities", element: <UtilitiesPage /> },
    { path: "chemicals", element: <ChemicalsPage /> },
    { path: "sds", element: <SdsPage /> },
    { path: "waste", element: <WastePage /> },
    { path: "wastewater", element: <WastewaterPage /> },
    { path: "audits", element: <AuditsPage /> },
    { path: "capa", element: <CapaPage /> },
    { path: "reports", element: <ReportsPage /> },
    { path: "documents", element: <DocumentsPage /> },
    { path: "complaint-box", element: <ComplaintBoxPage /> },
    { path: "incidents", element: <IncidentsPage /> },
    { path: "training", element: <TrainingPage /> },
    settingsRoute,
    { path: "notifications", element: <NotificationsPage /> },
    { path: "*", element: <NotFoundPage /> },
  ],
}];
