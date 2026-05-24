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
  page("status_relations", "compliance", "Status relations", "Page-wise status relation setup for approval flow.", GitBranch, "SettingsStatusRelationsPage", () => import("@/features/admin/settings/pages/SettingsStatusRelationsPage"), { hidden: true }),
  page("role_mapping", "compliance", "Role mapping", "Map page-wise status relations to roles.", ShieldCheck, "SettingsRoleMappingPage", () => import("@/features/admin/settings/pages/SettingsRoleMappingPage"), { hidden: true }),
  page("status_store", "compliance", "Status store", "Central status store for approval pages.", GitBranch, "SettingsStatusStorePage", () => import("@/features/admin/settings/pages/SettingsStatusStorePage"), { hidden: true, segment: "approvals/statusStore", to: "/settings/approvals/statusStore" }),
  page("page_wise_status", "compliance", "Page wise status", "Assign statuses to each page and maintain their order.", GitBranch, "SettingsPageWiseStatusPage", () => import("@/features/admin/settings/pages/SettingsPageWiseStatusPage"), { hidden: true, segment: "approvals/pageWiseStatus", to: "/settings/approvals/pageWiseStatus" }),
  page("role_wise_status", "compliance", "Role wise status", "Role-based approval status access and workflow setup.", ShieldCheck, "SettingsRoleWiseStatusPage", () => import("@/features/admin/settings/pages/SettingsRoleWiseStatusPage"), { hidden: true, segment: "approvals/roleWiseStatus", to: "/settings/approvals/roleWiseStatus" }),
  page("user_wise_status", "compliance", "User wise status", "User-based approval status setup and assignment.", UserRound, "SettingsUserWiseStatusPage", () => import("@/features/admin/settings/pages/SettingsUserWiseStatusPage"), { hidden: true, segment: "approvals/userWiseStatus", to: "/settings/approvals/userWiseStatus" }),
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
  page("approvals", "compliance", "Approvals", "Restricted list, SDS rules, and approval settings.", ShieldCheck, "SettingsApprovalsPage", () => import("@/features/admin/settings/pages/SettingsApprovalsPage")),
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
  options?: Partial<Pick<SettingsRouteDef, "hidden" | "segment" | "to">>,
): SettingsRouteDef {
  const segment = options?.segment ?? key.replace("_", "-");
  const to = options?.to ?? `/settings/${segment}`;
  return { key, segment, tab, title, description, icon, openAs: "page", to, exportName, load, ...options };
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

