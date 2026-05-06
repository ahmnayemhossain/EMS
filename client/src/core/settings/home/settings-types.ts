import type { LucideIcon } from "lucide-react";

export type SettingsTab = "system" | "operations" | "compliance" | "communications";

export type SettingsCardKey =
  | "employees" | "users" | "roles" | "departments" | "designations"
  | "uom" | "sources" | "meters" | "suppliers" | "companies"
  | "email" | "complaint_box" | "thresholds" | "approvals";

export type SettingsCardDef = {
  key: SettingsCardKey;
  tab: SettingsTab;
  title: string;
  description: string;
  icon: LucideIcon;
  openAs: "page" | "drawer";
  to?: string;
};
