import * as React from "react";
import { createBrowserRouter, createHashRouter, Navigate } from "react-router";

import { AppShell } from "@/layouts/AppShell";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AuditCalendarPage } from "@/pages/AuditCalendarPage";
import { FacilityDashboardPage } from "@/pages/FacilityDashboardPage";
import { UtilitiesPage } from "@/pages/UtilitiesPage";
import { ChemicalsPage } from "@/pages/ChemicalsPage";
import { SdsPage } from "@/pages/SdsPage";
import { WastePage } from "@/pages/WastePage";
import { WastewaterPage } from "@/pages/WastewaterPage";
import { AuditsPage } from "@/pages/AuditsPage";
import { CapaPage } from "@/pages/CapaPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { ComplaintBoxPage } from "@/pages/ComplaintBoxPage";
import { TrainingPage } from "@/pages/TrainingPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { PublicReportBoxPage } from "@/pages/PublicReportBoxPage";

const routes = [
  {
    path: "/report-box",
    element: <Navigate to="/rb/hfl" replace />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "report-box",
    element: <Navigate to="/rb/hfl" replace />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/rb/:code",
    element: <PublicReportBoxPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "rb/:code",
    element: <PublicReportBoxPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/",
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "index.html", element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "audit-calendar", element: <AuditCalendarPage /> },
      // Prefer "factories" in URLs, but keep legacy "facilities" for compatibility.
      { path: "factories/:id", element: <FacilityDashboardPage /> },
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
      { path: "settings", element: <SettingsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router =
  typeof window !== "undefined" &&
  window.location.pathname === "/" &&
  window.location.hash.startsWith("#/")
    ? createHashRouter(routes)
    : createBrowserRouter(routes);
