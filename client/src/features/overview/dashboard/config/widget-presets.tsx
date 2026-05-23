import { Building2, CalendarDays, ClipboardCheck, LineChart, Zap } from "lucide-react";

export type DashboardWidgetPresetKey =
  | "utility_overview"
  | "utility_trend"
  | "utility_approval_queue"
  | "company_snapshot"
  | "audit_calendar";

export type DashboardWidgetPreset = {
  key: DashboardWidgetPresetKey;
  name: string;
  description: string;
  defaultSpan: number;
  defaultRows: number;
  icon: typeof Zap;
};

export const dashboardWidgetPresets: DashboardWidgetPreset[] = [
  {
    key: "utility_overview",
    name: "Utility overview",
    description: "Monthly utility totals, missing bills, and high variance count.",
    defaultSpan: 6,
    defaultRows: 3,
    icon: Zap,
  },
  {
    key: "utility_trend",
    name: "Utility trend",
    description: "Rolling electricity trend from saved utility records.",
    defaultSpan: 6,
    defaultRows: 4,
    icon: LineChart,
  },
  {
    key: "utility_approval_queue",
    name: "Utility approval queue",
    description: "Draft, pending, approved, and audited month counts.",
    defaultSpan: 6,
    defaultRows: 3,
    icon: ClipboardCheck,
  },
  {
    key: "company_snapshot",
    name: "Company snapshot",
    description: "Active company count and short-name list.",
    defaultSpan: 6,
    defaultRows: 3,
    icon: Building2,
  },
  {
    key: "audit_calendar",
    name: "Audit calendar",
    description: "Current month audit calendar.",
    defaultSpan: 6,
    defaultRows: 4,
    icon: CalendarDays,
  },
];

export function getDashboardWidgetPreset(key: string) {
  return dashboardWidgetPresets.find((item) => item.key === key) || null;
}
