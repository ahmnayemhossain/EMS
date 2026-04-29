import { Building2, Gauge, Mail, MessagesSquare, Ruler, ShieldCheck, SlidersHorizontal, UsersRound, UserRound, Wrench } from "lucide-react";

import type { SettingsCardDef } from "@/pages/settings/home/settings-types";

export const settingsTabs = ["system", "operations", "compliance", "communications"] as const;

export const settingsCards: SettingsCardDef[] = [
  { key: "employees", tab: "system", title: "Employees", description: "Employee directory, ownership, assignees, and handlers.", icon: UsersRound, openAs: "page", to: "/settings/employees" },
  { key: "users", tab: "system", title: "Users", description: "Application accounts, login identity, and user status.", icon: UserRound, openAs: "page", to: "/settings/users" },
  { key: "roles", tab: "system", title: "Roles", description: "Permissions by role and company access scope.", icon: ShieldCheck, openAs: "page", to: "/settings/roles" },
  { key: "departments", tab: "system", title: "Departments", description: "Standardize departments used across the app.", icon: Building2, openAs: "page", to: "/settings/departments" },
  { key: "designations", tab: "system", title: "Designations", description: "Standardize job titles used for employees.", icon: Wrench, openAs: "page", to: "/settings/designations" },
  { key: "companies", tab: "operations", title: "Companies", description: "Manage company name, short name, local name, address, and status.", icon: Building2, openAs: "page", to: "/settings/companies" },
  { key: "uom", tab: "operations", title: "Units (UOM)", description: "Unified units across utilities and operations.", icon: Ruler, openAs: "page", to: "/settings/uom" },
  { key: "sources", tab: "operations", title: "Sources", description: "Manage utility sources and source wiring.", icon: Gauge, openAs: "page", to: "/settings/sources" },
  { key: "suppliers", tab: "operations", title: "Suppliers", description: "Suppliers for chemicals, waste vendors, and labs.", icon: Gauge, openAs: "page", to: "/settings/suppliers" },
  { key: "thresholds", tab: "compliance", title: "Thresholds", description: "Wastewater and utilities thresholds for alerts.", icon: SlidersHorizontal, openAs: "drawer" },
  { key: "approvals", tab: "compliance", title: "Approvals", description: "Restricted list, SDS rules, and approval settings.", icon: ShieldCheck, openAs: "drawer" },
  { key: "email", tab: "communications", title: "Email setup", description: "SMTP and sender identity for notifications.", icon: Mail, openAs: "drawer" },
  { key: "complaint_box", tab: "communications", title: "Complaint box", description: "Public URL behavior, routing, and retention rules.", icon: MessagesSquare, openAs: "drawer" },
];
