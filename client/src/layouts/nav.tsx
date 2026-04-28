import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  CalendarDays,
  Droplets,
  FileText,
  Gauge,
  LayoutDashboard,
  Leaf,
  LineChart,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  end?: boolean;
};

export const emsNavGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:read",
        end: true,
      },
      {
        label: "Audit calendar",
        to: "/audit-calendar",
        icon: CalendarDays,
        permission: "audit-calendar:read",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Utilities", to: "/utilities", icon: Gauge, permission: "utilities:read" },
      { label: "Chemicals", to: "/chemicals", icon: Leaf, permission: "chemicals:read" },
      { label: "SDS / MSDS", to: "/sds", icon: FileText, permission: "sds:read" },
      { label: "Waste", to: "/waste", icon: Sparkles, permission: "waste:read" },
      {
        label: "Wastewater / ETP",
        to: "/wastewater",
        icon: Droplets,
        permission: "wastewater:read",
      },
    ],
  },
  {
    label: "Assurance",
    items: [
      { label: "Audits", to: "/audits", icon: ShieldCheck, permission: "audits:read" },
      { label: "CAPA", to: "/capa", icon: ClipboardList, permission: "capa:read" },
      { label: "Reports", to: "/reports", icon: LineChart, permission: "reports:read" },
      { label: "Documents", to: "/documents", icon: FileText, permission: "documents:read" },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Complaint box",
        to: "/complaint-box",
        icon: MessageSquareWarning,
        permission: "complaints:read",
      },
      {
        label: "Incidents",
        to: "/incidents",
        icon: TriangleAlert,
        permission: "incidents:read",
      },
      { label: "Training", to: "/training", icon: UsersRound, permission: "training:read" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Settings", to: "/settings", icon: Settings, permission: "settings:read" },
    ],
  },
];
