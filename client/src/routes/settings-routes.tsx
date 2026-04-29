import { SettingsCompaniesPage } from "@/pages/settings/SettingsCompaniesPage";
import { SettingsDepartmentsPage } from "@/pages/settings/SettingsDepartmentsPage";
import { SettingsDesignationsPage } from "@/pages/settings/SettingsDesignationsPage";
import { SettingsEmployeesPage } from "@/pages/settings/SettingsEmployeesPage";
import { SettingsHomePage } from "@/pages/settings/SettingsHomePage";
import { SettingsLayout } from "@/pages/settings/SettingsLayout";
import { SettingsRolesPage } from "@/pages/settings/SettingsRolesPage";
import { SettingsSourcesPage } from "@/pages/settings/SettingsSourcesPage";
import { SettingsSuppliersPage } from "@/pages/settings/SettingsSuppliersPage";
import { SettingsUomPage } from "@/pages/settings/SettingsUomPage";
import { SettingsUsersPage } from "@/pages/settings/SettingsUsersPage";

export const settingsRoute = {
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
};
