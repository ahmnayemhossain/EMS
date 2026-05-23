import { Building2, FileSpreadsheet, Gauge, GitBranch, LayoutDashboard, MailCheck, MessagesSquare, Ruler, ShieldCheck, SlidersHorizontal, UserRound, UsersRound, Wrench } from "lucide-react";

import type { SettingsCardDef, SettingsCardKey } from "@/features/admin/settings/home/settings-types";

export type SettingsRouteDef = SettingsCardDef & {
  segment: string;
  exportName?: string;
  load?: () => Promise<Record<string, unknown>>;
};

export const settingsRouteDefs: SettingsRouteDef[] = [
  page("employees", "system", "Employees", "Employee directory, ownership, assignees, and handlers.", UsersRound, "SettingsEmployeesPage", () => import("@/features/admin/settings/pages/SettingsEmployeesPage")),
  page("users", "system", "Users", "Application accounts, login identity, and user status.", UserRound, "SettingsUsersPage", () => import("@/features/admin/settings/pages/SettingsUsersPage")),
  page("roles", "system", "Roles", "Permissions by role and company access scope.", ShieldCheck, "SettingsRolesPage", () => import("@/features/admin/settings/pages/SettingsRolesPage")),
  page("reports", "system", "Reports", "Report control: name, description, query, and variables.", FileSpreadsheet, "SettingsReportsPage", () => import("@/features/admin/settings/pages/SettingsReportsPage")),
  page("status_relations", "compliance", "Status relations", "Page-wise status relation setup for approval flow.", GitBranch, "SettingsStatusRelationsPage", () => import("@/features/admin/settings/pages/SettingsStatusRelationsPage")),
  page("role_mapping", "compliance", "Role mapping", "Map page-wise status relations to roles.", ShieldCheck, "SettingsRoleMappingPage", () => import("@/features/admin/settings/pages/SettingsRoleMappingPage")),
  page("departments", "system", "Departments", "Standardize departments used across the app.", Building2, "SettingsDepartmentsPage", () => import("@/features/admin/settings/pages/SettingsDepartmentsPage")),
  page("designations", "system", "Designations", "Standardize job titles used for employees.", Wrench, "SettingsDesignationsPage", () => import("@/features/admin/settings/pages/SettingsDesignationsPage")),
  page("dashboard_widgets", "system", "Dashboard widgets", "Manage reusable widgets that can be added to dashboard containers.", LayoutDashboard, "SettingsDashboardWidgetsPage", () => import("@/features/admin/settings/pages/SettingsDashboardWidgetsPage")),
  page("companies", "operations", "Companies", "Manage company name, short name, local name, address, and status.", Building2, "SettingsCompaniesPage", () => import("@/features/admin/settings/pages/SettingsCompaniesPage")),
  page("utilities_rules", "operations", "Utilities rules", "Admin controls for utilities calculations and conversions.", Gauge, "SettingsUtilitiesRulesPage", () => import("@/features/admin/settings/pages/SettingsUtilitiesRulesPage")),
  page("uom", "operations", "Units (UOM)", "Unified units across utilities and operations.", Ruler, "SettingsUomPage", () => import("@/features/admin/settings/pages/SettingsUomPage")),
  page("sources", "operations", "Sources", "Manage utility sources and source wiring.", Gauge, "SettingsSourcesPage", () => import("@/features/admin/settings/pages/SettingsSourcesPage")),
  page("meters", "operations", "Meters", "Meters and wiring for utilities (company, type, source, UOM).", Gauge, "SettingsMetersPage", () => import("@/features/admin/settings/pages/SettingsMetersPage")),
  page("suppliers", "operations", "Suppliers", "Suppliers for chemicals, waste vendors, and labs.", Gauge, "SettingsSuppliersPage", () => import("@/features/admin/settings/pages/SettingsSuppliersPage")),
  drawer("thresholds", "compliance", "Thresholds", "Wastewater and utilities thresholds for alerts.", SlidersHorizontal),
  drawer("approvals", "compliance", "Approvals", "Restricted list, SDS rules, and approval settings.", ShieldCheck),
  page("email", "communications", "Email setup", "SMTP, login notification toggle, and HTML template.", MailCheck, "SettingsEmailPage", () => import("@/features/admin/settings/pages/SettingsEmailPage")),
  drawer("complaint_box", "communications", "Complaint box", "Public URL behavior, routing, and retention rules.", MessagesSquare, "complaint-box"),
];

export const settingsTabs = ["system", "operations", "compliance", "communications"] as const;

export function findSettingsCard(key: SettingsCardKey | null) {
  return key ? settingsRouteDefs.find((item) => item.key === key) ?? null : null;
}

function page(
  key: SettingsCardKey,
  tab: SettingsRouteDef["tab"],
  title: string,
  description: string,
  icon: SettingsRouteDef["icon"],
  exportName: string,
  load: NonNullable<SettingsRouteDef["load"]>,
): SettingsRouteDef {
  const segment = key.replace("_", "-");
  return { key, segment, tab, title, description, icon, openAs: "page", to: `/settings/${segment}`, exportName, load };
}

function drawer(
  key: SettingsCardKey,
  tab: SettingsRouteDef["tab"],
  title: string,
  description: string,
  icon: SettingsRouteDef["icon"],
  segment = key.replace("_", "-"),
): SettingsRouteDef {
  return { key, segment, tab, title, description, icon, openAs: "drawer" };
}

