import * as React from "react";
import { createBrowserRouter, createHashRouter, Navigate, useLocation } from "react-router";

import { useAuth } from "@/app/state/auth";
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
import { SettingsLayout } from "@/pages/settings/SettingsLayout";
import { SettingsHomePage } from "@/pages/settings/SettingsHomePage";
import { SettingsEmployeesPage } from "@/pages/settings/SettingsEmployeesPage";
import { SettingsUsersPage } from "@/pages/settings/SettingsUsersPage";
import { SettingsRolesPage } from "@/pages/settings/SettingsRolesPage";
import { SettingsCompaniesPage } from "@/pages/settings/SettingsCompaniesPage";
import { SettingsDepartmentsPage } from "@/pages/settings/SettingsDepartmentsPage";
import { SettingsDesignationsPage } from "@/pages/settings/SettingsDesignationsPage";
import { SettingsUomPage } from "@/pages/settings/SettingsUomPage";
import { SettingsSourcesPage } from "@/pages/settings/SettingsSourcesPage";
import { SettingsSuppliersPage } from "@/pages/settings/SettingsSuppliersPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { PublicReportBoxPage } from "@/pages/PublicReportBoxPage";
import { SignInPage } from "@/pages/SignInPage";

function ProtectedAppShell() {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <AppShell />;
}

const routes = [
  {
    path: "/sign-in",
    element: <SignInPage />,
    errorElement: <RouteErrorPage />,
  },
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
    element: <ProtectedAppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "index.html", element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "audit-calendar", element: <AuditCalendarPage /> },
      // Prefer "companies" in URLs, but keep legacy "facilities" for compatibility.
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
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <SettingsHomePage /> },
          { path: "employees", element: <SettingsEmployeesPage /> },
          { path: "users", element: <SettingsUsersPage /> },
          { path: "roles", element: <SettingsRolesPage /> },
          { path: "departments", element: <SettingsDepartmentsPage /> },
          { path: "designations", element: <SettingsDesignationsPage /> },
          { path: "companies", element: <SettingsCompaniesPage /> },
          { path: "uom", element: <SettingsUomPage /> },
          { path: "sources", element: <SettingsSourcesPage /> },
          { path: "suppliers", element: <SettingsSuppliersPage /> },
        ],
      },
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
